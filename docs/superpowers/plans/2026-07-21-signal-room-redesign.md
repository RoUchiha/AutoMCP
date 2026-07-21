# Signal Room Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved Signal Room interface while preserving AutoMCP's deterministic, policy-first compiler behavior.

**Architecture:** Keep editable specification state and compilation inside `ProjectWorkbench`; split new explanatory surfaces into small presentational components receiving typed, derived values. The page shell supplies product framing, and CSS provides the visual system without image assets or new dependencies.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Testing Library, CSS, Vercel.

## Global Constraints

- Keep Hybrid as the initial Local/Cloud/Hybrid deployment selection.
- Preserve Advanced capabilities as an accessible on/off switch that gates webhook, scheduled-job, and workflow suggestions.
- Never call the user endpoint, retain a user secret, or claim external source validation from the demo.
- Derive visible package facts from `AutoMcpSpec`, `PolicyReport`, and `CompiledProject.manifest`; do not introduce fictional counts or provisioning states.
- Use `Georgia`, `Cambria`, and system humanist sans fallbacks; reserve monospace for compact technical metadata.
- Add no external UI dependency and no raster design asset.
- Preserve keyboard access, focus states, reduced-motion behavior, and non-color status signals.

---

### Task 1: Establish the Signal Room content contract

**Files:**
- Modify: `tests/project-workbench.test.tsx`
- Modify: `src/components/project-workbench.tsx`

**Interfaces:**
- Consumes: `AutoMcpSpec`, `PolicyReport`, and `CompiledProject` already constructed in `ProjectWorkbench`.
- Produces: `WorkflowRail`, `CapabilityMap`, and `BuildReceipt` presentational functions with typed props in `project-workbench.tsx`.

- [ ] **Step 1: Write the failing content-contract tests**

```tsx
it("shows the four-stage creation flow and factual build receipt", () => {
  render(<ProjectWorkbench />);
  expect(screen.getByText("Intent")).toBeInTheDocument();
  expect(screen.getByText("Source")).toBeInTheDocument();
  expect(screen.getByText("Policy")).toBeInTheDocument();
  expect(screen.getByText("Package")).toBeInTheDocument();
  expect(screen.getByText(/policy and contract checks/i)).toBeInTheDocument();
  expect(screen.getByText(/operations generated/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm.cmd test -- tests/project-workbench.test.tsx`

Expected: FAIL because the workflow stages and receipt do not exist.

- [ ] **Step 3: Add minimal typed presentational surfaces**

```tsx
type BuildReceiptProps = {
  allowed: boolean;
  operationCount: number;
  deploymentMode: AutoMcpSpec["deploymentMode"];
};

function BuildReceipt({ allowed, operationCount, deploymentMode }: BuildReceiptProps) {
  return <section aria-label="Build receipt">
    <p>{allowed ? "Policy and contract checks complete" : "Policy review required"}</p>
    <p>{operationCount} operations generated</p>
    <p>{deploymentMode === "local" ? "stdio package" : "remote-ready package guidance"}</p>
  </section>;
}
```

Render `WorkflowRail` with `Intent`, `Source`, `Policy`, and `Package`; render `CapabilityMap` and `BuildReceipt` from existing `report`, `compiled`, and `spec` values. Replace the source note with exact language that says the demo does not call the endpoint or retain credentials.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm.cmd test -- tests/project-workbench.test.tsx`

Expected: PASS, including the existing Advanced capabilities interaction test.

- [ ] **Step 5: Commit the behavior contract**

```bash
git add tests/project-workbench.test.tsx src/components/project-workbench.tsx && git commit -m "feat: add Signal Room workflow surfaces"
```

### Task 2: Recompose the page around the explicit creation flow

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/project-workbench.tsx`
- Test: `tests/project-workbench.test.tsx`

**Interfaces:**
- Consumes: Task 1's `WorkflowRail`, `CapabilityMap`, and `BuildReceipt` functions.
- Produces: semantic hero, staged form regions, and an `aria-live` receipt path that preserves `download()`.

- [ ] **Step 1: Write the failing interaction test**

```tsx
it("keeps advanced modules behind the policy opt-in in the new flow", async () => {
  const user = userEvent.setup();
  render(<ProjectWorkbench />);
  expect(screen.queryByText("Scheduled jobs")).not.toBeInTheDocument();
  await user.click(screen.getByRole("switch", { name: /advanced capabilities/i }));
  expect(screen.getByText("Scheduled jobs")).toBeInTheDocument();
  expect(screen.getByText(/dry-run review before compilation/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm.cmd test -- tests/project-workbench.test.tsx`

Expected: FAIL until the Policy stage presents the advanced-policy explanation.

- [ ] **Step 3: Implement semantic staged regions without changing compiler state**

```tsx
<section className="signal-stage" aria-labelledby="source-stage-title">
  <div className="stage-kicker">02 / Source</div>
  <h2 id="source-stage-title">Connect the information your agent may use.</h2>
  <label htmlFor="source-endpoint">API or data source endpoint</label>
  <input id="source-endpoint" value={spec.source.url ?? ""} />
  <p>This demo does not call your endpoint or retain credentials.</p>
</section>
```

Update `page.tsx` with an editorial title and truth statement. Group existing inputs, selector, Advanced switch, validation report, capability map, preview, and download action into the four named workflow regions. Preserve all existing setters, `download()`, selected-file tabs, and policy blocking.

- [ ] **Step 4: Run focused and full unit tests**

Run: `npm.cmd test -- tests/project-workbench.test.tsx; npm.cmd test`

Expected: all focused tests and the full Vitest suite PASS.

- [ ] **Step 5: Commit the semantic flow**

```bash
git add src/app/page.tsx src/components/project-workbench.tsx tests/project-workbench.test.tsx && git commit -m "feat: reshape workbench into Signal Room flow"
```

### Task 3: Implement the visual system and publish it

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `tests/smoke.test.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: semantic class names and regions from Task 2.
- Produces: responsive Signal Room presentation, current metadata, release documentation, and a verified live deployment.

- [ ] **Step 1: Write the failing metadata test**

```ts
it("declares the Signal Room product title", async () => {
  const metadata = (await import("@/app/layout")).metadata;
  expect(metadata.title).toBe("AutoMCP — Signal Room");
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm.cmd test -- tests/smoke.test.ts`

Expected: FAIL because the existing document title does not name Signal Room.

- [ ] **Step 3: Add visual tokens and responsive layout**

```css
:root {
  --signal-blue: #0a3eb1;
  --signal-paper: #fffdf8;
  --signal-ink: #101529;
  --signal-coral: #f4321a;
  --signal-lime: #a8c928;
  --signal-line: #ced1d8;
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
```

Replace dark, pill-heavy styling with a cobalt field, cream workspace, fine rules, editorial display stack (`Georgia`, `Cambria`, serif), vermilion primary action, focus-visible rules, narrow-screen stack, and `prefers-reduced-motion: reduce`. Update `layout.tsx` metadata title to `AutoMCP — Signal Room`.

- [ ] **Step 4: Update docs and run complete verification**

Add this README section near the product walkthrough:

```markdown
## Signal Room workflow

The interface walks a project through Intent, Source, Policy, and Package. It derives the visible receipt from the canonical spec, policy report, and compiled manifest. The demo never calls a supplied endpoint or stores a credential.
```

Run: `npm.cmd test; npm.cmd run build; npm.cmd audit --omit=dev --json`

Expected: all tests PASS, production build completes, and audit reports zero production vulnerabilities.

- [ ] **Step 5: Commit, push, deploy, and validate**

```bash
git add src/app/globals.css src/app/layout.tsx tests/smoke.test.ts README.md && git commit -m "style: apply Signal Room visual language" && git push origin HEAD:main && npx.cmd --yes vercel@latest --prod --yes
```

Validate the production alias as an anonymous visitor: four workflow labels are visible, deployment changes selection, Advanced exposes Scheduled jobs, and the download button is present and operable.

## Plan self-review

- **Spec coverage:** Tasks 1-2 cover workflow, truthful build receipt, source boundary, semantics, and Advanced policy controls. Task 3 covers visual system, responsive/accessibility requirements, documentation, tests, build/audit, deployment, and live validation.
- **Completeness scan:** No unresolved scope markers, deferred implementation language, or unspecified commands remain.
- **Type consistency:** `BuildReceiptProps` uses `AutoMcpSpec["deploymentMode"]`; every layout surface consumes values already present in `ProjectWorkbench`.
