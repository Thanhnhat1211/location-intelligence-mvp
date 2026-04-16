import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

/**
 * Server-side Claude API health check.
 * The API key lives on the server (ANTHROPIC_API_KEY env var) — never exposed
 * to the client. This route verifies the key is present and working by making
 * a minimal 1-token request.
 */
export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        status: "not_configured",
        message: "Chưa cấu hình ANTHROPIC_API_KEY trong biến môi trường",
      },
      { status: 200 }
    );
  }

  const started = Date.now();

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 5,
      messages: [{ role: "user", content: "ping" }],
    });

    const latency = Date.now() - started;
    const hasContent = response.content.some((b) => b.type === "text");

    return NextResponse.json({
      status: "connected",
      message: `Kết nối thành công (${latency}ms)`,
      latency,
      model: response.model,
      hasContent,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    const isAuthError = /401|invalid.*api.*key|authentication/i.test(message);

    return NextResponse.json(
      {
        status: isAuthError ? "invalid_key" : "error",
        message: isAuthError
          ? "API key không hợp lệ hoặc đã hết hạn"
          : `Lỗi kết nối: ${message}`,
      },
      { status: 200 }
    );
  }
}
