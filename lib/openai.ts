/**
 * OpenAI integration layer for strategy memo enhancement.
 *
 * Safety contract:
 * - Server-side only (reads process.env.OPENAI_API_KEY, never NEXT_PUBLIC_*)
 * - Falls back to the deterministic mock memo on ANY failure
 * - Never invents numbers — only refines text fields (summary, SWOT, recs)
 * - roiProjection is always preserved from the deterministic engine
 */

import OpenAI from "openai";
import type { StrategyMemo, BusinessModel } from "@/types/analysis";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns true when an API key is present in the server environment. */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Context passed to OpenAI so it can refine the strategy memo.
 * All numbers here are deterministic and must NOT be changed by the LLM.
 */
export interface StrategyContext {
  address: string;
  district: string;
  businessModel: BusinessModel;
  overallScore: number;
  breakdown: {
    location: number;
    demographics: number;
    competition: number;
    infrastructure: number;
  };
  competitorCount: number;
  averageRent: number;
  medianIncome: number;
  vacancyRate: number;
  marketSaturation: number;
}

/**
 * Enhance a deterministic StrategyMemo with OpenAI-generated text.
 *
 * - If OPENAI_API_KEY is missing → returns the original memo unchanged.
 * - If the API call fails or returns unparseable JSON → returns the original.
 * - On success, merges AI text into the memo while preserving roiProjection
 *   and deterministic metadata.
 */
export async function enhanceStrategyMemo(
  baseMemo: StrategyMemo,
  context: StrategyContext
): Promise<StrategyMemo> {
  if (!isOpenAIConfigured()) {
    return baseMemo;
  }

  try {
    const aiOutput = await callOpenAI(baseMemo, context);
    return mergeAIOutput(baseMemo, aiOutput);
  } catch (err) {
    console.warn(
      "[openai] Enhancement failed, using deterministic memo:",
      err instanceof Error ? err.message : err
    );
    return baseMemo;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Shape we ask the LLM to return (text-only fields). */
interface AIStrategyOutput {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendations: {
    priority: "high" | "medium" | "low";
    action: string;
    expectedImpact: string;
  }[];
}

function buildClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function callOpenAI(
  baseMemo: StrategyMemo,
  ctx: StrategyContext
): Promise<AIStrategyOutput> {
  const client = buildClient();

  const systemPrompt = `You are a Vietnamese business location analyst. Given deterministic analysis data, improve the strategy memo text. Respond ONLY with valid JSON matching the schema below — no markdown, no code fences.

JSON schema:
{
  "summary": "string — 2-3 sentence executive summary in Vietnamese",
  "strengths": ["string[] — 2-4 key strengths in Vietnamese"],
  "weaknesses": ["string[] — 2-4 key weaknesses in Vietnamese"],
  "opportunities": ["string[] — 2-4 business opportunities in Vietnamese"],
  "threats": ["string[] — 2-4 threats/risks in Vietnamese"],
  "recommendations": [
    { "priority": "high|medium|low", "action": "string in Vietnamese", "expectedImpact": "string in Vietnamese" }
  ]
}

Rules:
- Write in Vietnamese
- Do NOT invent numbers, scores, prices, or statistics
- Do NOT change the overall score or breakdown scores
- Focus on actionable business insight, not generic advice
- Keep each array to 2-4 items
- recommendations array must have 2-4 items`;

  const userPrompt = `Địa điểm: ${ctx.address}, ${ctx.district}
Mô hình: ${formatModelLabel(ctx.businessModel)}
Điểm tổng: ${ctx.overallScore}/100
Vị trí: ${ctx.breakdown.location} | Nhân khẩu: ${ctx.breakdown.demographics} | Cạnh tranh: ${ctx.breakdown.competition} | Hạ tầng: ${ctx.breakdown.infrastructure}
Đối thủ gần: ${ctx.competitorCount}
Giá thuê TB: ${(ctx.averageRent / 1_000_000).toFixed(1)} triệu/tháng
Thu nhập TB: ${(ctx.medianIncome / 1_000_000).toFixed(1)} triệu/tháng
Tỉ lệ trống: ${ctx.vacancyRate}%
Bão hòa thị trường: ${ctx.marketSaturation}/100

Memo hiện tại:
${JSON.stringify({
    summary: baseMemo.summary,
    strengths: baseMemo.strengths,
    weaknesses: baseMemo.weaknesses,
    opportunities: baseMemo.opportunities,
    threats: baseMemo.threats,
    recommendations: baseMemo.recommendations,
  })}

Hãy cải thiện memo trên, giữ nguyên các con số.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 1200,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from OpenAI");
  }

  return parseAIResponse(raw);
}

function parseAIResponse(raw: string): AIStrategyOutput {
  // Strip markdown fences if the model ignores instructions
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  // Validate required fields
  if (
    typeof parsed.summary !== "string" ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.weaknesses) ||
    !Array.isArray(parsed.opportunities) ||
    !Array.isArray(parsed.threats) ||
    !Array.isArray(parsed.recommendations)
  ) {
    throw new Error("AI response missing required fields");
  }

  // Validate recommendations shape
  const validPriorities = new Set(["high", "medium", "low"]);
  const recommendations = parsed.recommendations
    .filter(
      (r: Record<string, unknown>) =>
        typeof r.action === "string" &&
        typeof r.expectedImpact === "string" &&
        validPriorities.has(r.priority as string)
    )
    .slice(0, 4) as AIStrategyOutput["recommendations"];

  if (recommendations.length === 0) {
    throw new Error("AI response has no valid recommendations");
  }

  return {
    summary: String(parsed.summary).slice(0, 500),
    strengths: toStringArray(parsed.strengths, 4),
    weaknesses: toStringArray(parsed.weaknesses, 4),
    opportunities: toStringArray(parsed.opportunities, 4),
    threats: toStringArray(parsed.threats, 4),
    recommendations,
  };
}

/** Merge AI text into the base memo, preserving roiProjection and metadata. */
function mergeAIOutput(
  baseMemo: StrategyMemo,
  ai: AIStrategyOutput
): StrategyMemo {
  return {
    summary: ai.summary,
    strengths: ai.strengths,
    weaknesses: ai.weaknesses,
    opportunities: ai.opportunities,
    threats: ai.threats,
    recommendations: ai.recommendations,
    // Deterministic — never overwritten by AI
    roiProjection: baseMemo.roiProjection,
    generatedBy: "OpenAI GPT-4o + Local Engine v1.0",
    generatedAt: baseMemo.generatedAt,
  };
}

function toStringArray(arr: unknown[], max: number): string[] {
  return arr
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .slice(0, max);
}

function formatModelLabel(model: BusinessModel): string {
  const labels: Record<BusinessModel, string> = {
    fnb: "F&B / Nhà hàng",
    airbnb: "Airbnb / Homestay",
    retail: "Bán lẻ / Cửa hàng",
  };
  return labels[model];
}
