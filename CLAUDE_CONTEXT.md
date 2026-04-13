# CLAUDE_CONTEXT.md

## Project
Location Intelligence MVP

## Goal
This is a personal-use web app that analyzes a business/property location in Vietnam and returns:
- area summary
- estimated rent/sale range
- nearby business breakdown
- business model fit scores
- strategy memo
- risk flags

## Current stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Local JSON / CSV persistence for MVP
- Optional server-side OpenAI integration with mock fallback

## Important constraints
- Do NOT redesign the UI unless explicitly asked
- Keep the existing folder structure as much as possible
- Prefer minimal, local fixes over broad rewrites
- Keep the app usable as an MVP
- Server-side only for OpenAI keys
- No real DB yet
- No real external APIs required yet
- Preserve the current visual design and component layout

## Known repo issues already identified
1. Domain type mismatch:
   - Use only: "fnb" | "airbnb" | "retail"
   - Remove all "fb" usage

2. App Router architecture issue:
   - Some page files are client components and also export metadata
   - Fix by splitting into:
     - server page with metadata
     - client page body component

3. Missing API routes:
   - app/api/analyze/route.ts
   - app/api/history/route.ts
   - app/api/upload-comps/route.ts
   - and referenced dataset/history detail routes

4. Prop/type mismatches between pages and components:
   - BusinessFitGrid prop naming mismatch
   - SaveAnalysisButton callback mismatch
   - LoadingSkeleton prop mismatch
   - Multiple analyze/data/history card prop mismatches

5. Core pipeline issues:
   - analysis-engine imports generateId but utils does not export it
   - AnalysisResult shape is not fully aligned across engine/UI/API

6. OpenAI layer is placeholder-only:
   - Must stay server-side
   - Must have fallback mock behavior

## Target repair order
1. Standardize domain types
2. Fix App Router client/server metadata structure
3. Implement minimal working API routes
4. Fix all prop/type mismatches
5. Repair analysis engine + utils + AnalysisResult flow
6. Add safe server-side OpenAI integration with fallback

## Coding style
- Keep code readable and modular
- Prefer explicit interfaces over `any`
- Do not overengineer
- Minimize breaking changes
- Reuse existing types from `types/`
- If unsure, choose the smallest safe fix

## Required output format after each task
After editing code, always report:
1. Files changed
2. What was fixed
3. Any remaining blockers
4. Whether the app is closer to a working MVP
