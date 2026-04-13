# CLAUDE_VSCODE_PROMPTS.md

## How to use in VSCode with Claude
Before each task, open the repo root in VSCode and make sure Claude has access to the workspace files.
Paste `CLAUDE_CONTEXT.md` into the chat first, or attach it if your extension supports context files.
Then use ONE task prompt at a time.

Use this guardrail line at the top of every prompt:

```text
Do not redesign the UI. Keep the existing visual design and folder structure as much as possible. Focus only on the requested fix. After changes, summarize exactly which files were modified and why.
```

---

## Session bootstrap prompt
Use this first in a new Claude session:

```text
I am working on a Next.js App Router TypeScript project called Location Intelligence MVP.

Please read the repository files directly from the workspace and use them as the source of truth. Also use the attached/pasted project context below as additional guidance.

Important constraints:
- Do NOT redesign the UI unless explicitly asked
- Keep the existing folder structure as much as possible
- Prefer minimal, targeted fixes over broad rewrites
- Preserve current visual design
- Use server-side only for OpenAI keys
- Keep this as a local MVP using JSON/CSV persistence
- After making changes, summarize files changed, what was fixed, and remaining blockers

First, scan the repository and briefly confirm:
1. the current architecture
2. the most relevant files for the requested task
3. any obvious blockers before editing

Then perform only the requested task.
```

---

## Prompt 1 — Standardize domain types

```text
Do not redesign the UI. Keep the existing visual design and folder structure as much as possible. Focus only on the requested fix. After changes, summarize exactly which files were modified and why.

Audit and standardize the domain model types across the entire repo.

Current issues to fix:
- `types/analysis.ts` uses `BusinessModel = "fnb" | "airbnb" | "retail"`
- `lib/scoring.ts` uses `"fb" | "airbnb" | "retail"`
- `lib/analysis-engine.ts` also uses `"fb"`

Your task:
1. Choose ONE canonical business model union and use it everywhere:
   - `"fnb" | "airbnb" | "retail"`
2. Update all affected files so they import and use the same type source instead of redefining conflicting unions.
3. Remove duplicate `BusinessModel` type declarations from internal libs if possible, and import from `@/types/analysis` instead.
4. Align:
   - `types/analysis.ts`
   - `lib/scoring.ts`
   - `lib/analysis-engine.ts`
   - `hooks/use-history.ts`
   - any analyze/history/data/settings components or pages using business model values
5. Keep semantics unchanged, only normalize naming and type flow.
6. Convert all `"fb"` references to `"fnb"`.

Acceptance criteria:
- There is only one canonical `BusinessModel` union in the codebase.
- No file uses `"fb"` anymore.
- All references compile against the same type.
```

---

## Prompt 2 — Fix App Router metadata/client architecture

```text
Do not redesign the UI. Keep the existing visual design and folder structure as much as possible. Focus only on the requested fix. After changes, summarize exactly which files were modified and why.

Fix the Next.js App Router architecture issues related to `use client` and `metadata`.

Inspect first:
- `app/page.tsx`
- `app/analyze/page.tsx`
- `app/history/page.tsx`
- `app/data/page.tsx`
- `app/settings/page.tsx`

Your task:
1. For every page that needs client-side hooks, move the interactive logic into a separate client component file.
2. Convert the page file itself into a server page that exports `metadata` and renders the client component.
3. Use this pattern:
   - `app/analyze/page.tsx` = server page with metadata
   - `app/analyze/analyze-client.tsx` = `"use client"` page body
4. Apply the same pattern to all affected pages.
5. Do not change the visual structure of the pages.
6. Keep imports clean and avoid circular imports.

Acceptance criteria:
- No page file both uses `"use client"` and exports `metadata`.
- Existing page functionality is preserved.
- Server page vs client page split is clear.
```

---

## Prompt 3 — Implement minimal working API routes

```text
Do not redesign the UI. Keep the existing visual design and folder structure as much as possible. Focus only on the requested fix. After changes, summarize exactly which files were modified and why.

Implement the minimal working API layer for this MVP using simple file-based/local JSON persistence.

Current problems:
- `app/api/analyze/route.ts` is empty
- `app/api/history/route.ts` is empty
- `app/api/upload-comps/route.ts` is empty
- frontend also references:
  - `/api/history/[id]`
  - `/api/dataset/stats`
  - `/api/dataset/comps`

Implement:
1. `POST /api/analyze`
   - input: analysis filters
   - output: valid `AnalysisResult`
   - use `lib/analysis-engine.ts`
   - save created analysis into `data/analyses.json`

2. `GET /api/history`
   - return all analyses
   - optional `limit` query param

3. `DELETE /api/history`
   - clear all analyses

4. `GET /api/history/[id]`
   - return one analysis by id

5. `PATCH /api/history/[id]`
   - update `isSaved` and optionally `notes`

6. `DELETE /api/history/[id]`
   - delete one analysis by id

7. `POST /api/upload-comps`
   - accept uploaded CSV
   - parse with `lib/csv-parser.ts`
   - persist to `data/comps.json`

8. `GET /api/dataset/stats`
   - return dataset stats from comps JSON

9. `GET /api/dataset/comps`
   - return comps list
   - optional `limit` query param

Constraints:
- Use Node runtime where file system access is needed
- Keep it local-first for MVP
- Reuse existing types from `types/analysis.ts` and `types/dataset.ts`
- No real DB
- No external APIs yet
```

---

## Prompt 4 — Fix all prop/type mismatches

```text
Do not redesign the UI. Keep the existing visual design and folder structure as much as possible. Focus only on the requested fix. After changes, summarize exactly which files were modified and why.

Fix all prop mismatches and TypeScript contract mismatches between pages, components, and hooks.

Known issues:
- `BusinessFitGrid` expects `businessFitScores` but page passes `scores`
- `SaveAnalysisButton` expects `onSave` but page passes `onToggle`
- `LoadingSkeleton` does not support `height`, but pages pass `height`
- `AreaSummaryCard`, `NearbyBusinessBreakdown`, `PriceEstimateCard`, `StrategyMemoCard` have prop mismatches

Your task:
1. Search the repo for all page/component prop contract mismatches.
2. Fix them consistently in one direction:
   - either update page call sites
   - or update component prop definitions
   - choose the smallest safe change
3. Keep component names and layout intact.
4. Inspect carefully:
   - `app/page.tsx`
   - `app/analyze/*`
   - `app/history/*`
   - `app/data/*`
   - `components/analyze/*`
   - `components/history/*`
   - `components/data/*`
   - `components/shared/loading-skeleton.tsx`
5. If useful, add optional props for backward compatibility, but keep APIs clean.
6. Make sure callback signatures match actual usage.
7. Ensure every page compiles against component props.

Acceptance criteria:
- No page passes invalid props
- No component expects props that are never provided correctly
- `LoadingSkeleton` usage is consistent
```

---

## Prompt 5 — Repair analysis engine + utils + AnalysisResult shape

```text
Do not redesign the UI. Keep the existing visual design and folder structure as much as possible. Focus only on the requested fix. After changes, summarize exactly which files were modified and why.

Repair the core analysis pipeline so the analysis engine can generate a valid `AnalysisResult`.

Known issues:
- `lib/analysis-engine.ts` imports `generateId` from `lib/utils.ts`, but `generateId` does not exist
- there are likely shape mismatches between the engine output and `types/analysis.ts`
- API handlers and UI need one consistent `AnalysisResult`

Your task:
1. Inspect and fix:
   - `lib/analysis-engine.ts`
   - `lib/scoring.ts`
   - `lib/utils.ts`
   - `types/analysis.ts`
   - `types/location.ts`
   - `types/dataset.ts` if needed
2. Add missing utilities such as:
   - `generateId`
   - safe JSON read/write helpers if useful
3. Make `lib/analysis-engine.ts` return a COMPLETE valid `AnalysisResult`, including:
   - `id`
   - `location`
   - `filters`
   - `businessFitScores`
   - `nearbyBusinesses`
   - `priceEstimate`
   - `riskFlags`
   - `areaSummary`
   - `strategyMemo`
   - `recommendation`
   - `confidenceScore`
   - `status`
   - `isSaved`
   - timestamps
4. Ensure scoring output matches `BusinessFitScore`
5. Fill required fields with deterministic mock/local-data logic
6. Remove `any` where easy to replace with proper types
7. Keep the logic simple and deterministic
```

---

## Prompt 6 — Add server-side OpenAI integration with fallback

```text
Do not redesign the UI. Keep the existing visual design and folder structure as much as possible. Focus only on the requested fix. After changes, summarize exactly which files were modified and why.

Add a safe server-side OpenAI integration layer for strategy memo generation, with a mock fallback if the API key is missing.

Current state:
- `lib/openai.ts` is placeholder-only
- app must not expose OpenAI keys to the client
- MVP must still work without OpenAI

Your task:
1. Implement `lib/openai.ts` so it can:
   - accept structured analysis input
   - return structured strategy output
   - fall back to deterministic mock output if `OPENAI_API_KEY` is missing
2. Do NOT use `NEXT_PUBLIC_OPENAI_API_KEY`
3. Only call OpenAI from server-side code, not from client components
4. Integrate it into:
   - `app/api/analyze/route.ts`
   - and/or `lib/analysis-engine.ts`
5. The LLM may summarize and generate strategy/risk interpretation only
6. It must NOT invent raw pricing or comp data
7. If OpenAI fails, automatically fall back to local mock strategy generation

Suggested AI output shape:
- `summary`
- `strengths`
- `weaknesses`
- `opportunities`
- `threats`
- `recommendations`

Acceptance criteria:
- No API key exposed to client
- App works with and without OpenAI configured
- `POST /api/analyze` always returns valid analysis output
```

---

## Post-task verification prompt
Use this after each repair step:

```text
Please do a focused verification pass for the task you just completed.

Report:
1. files changed
2. what was fixed
3. any remaining blockers
4. whether the repo is now closer to a working MVP
5. any TODOs you intentionally left out

Do not begin the next task automatically.
```

---

## Final repo audit prompt
Use after finishing prompts 1–6:

```text
Please perform a full repository audit for this Next.js MVP.

Check for:
- remaining type mismatches
- broken imports
- missing API routes
- incorrect client/server boundaries
- placeholder logic that still blocks MVP
- unsafe OpenAI usage
- inconsistent domain types

Then provide:
1. MVP readiness score out of 10
2. blockers that must be fixed before real use
3. non-blocking polish items
4. exact next steps in priority order
```
