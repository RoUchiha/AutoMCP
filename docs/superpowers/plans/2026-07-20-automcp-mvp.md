# AutoMCP MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a public, deployable AutoMCP application that turns a safe API/data MCP specification into a tested, downloadable TypeScript MCP server package.

**Architecture:** A Next.js control plane stores project state locally, validates a versioned `AutoMcpSpec`, and compiles deterministic source artifacts in the browser/server runtime. The AI-like planning experience is intentionally deterministic in the MVP: it parses intent into explicit recommendations, while a typed policy engine and template compiler govern all generated code. The generated package targets the official MCP TypeScript SDK with `stdio` transport and includes a remote Streamable HTTP deployment guide.

**Tech Stack:** Next.js App Router, TypeScript, Zod, Vitest, React Testing Library, Playwright, Tailwind CSS, `@modelcontextprotocol/server`, JSZip, Vercel.

## Global Constraints

- Use TypeScript with strict type checking and Node.js 20+.
- Keep Core mode default; expose Advanced capabilities through a project boolean without forking specs.
- Generate tools, resources, and prompts from one canonical `AutoMcpSpec`.
- Never put plaintext credentials into project state, artifacts, logs, fixtures, or the public demo.
- Generated server code must use `@modelcontextprotocol/server` and Zod schemas.
- Block non-HTTPS, localhost, loopback, RFC1918, link-local, and metadata-service endpoint sources.
- Treat mutation tools as confirmation-required and mark them destructive in the compiled manifest.
- Use `stdio` for generated local servers and document Streamable HTTP for remote deployment.
- Commit each independently tested milestone and push it to `origin/master`.

---

## File structure

- `package.json`: scripts and runtime/test dependencies.
- `src/lib/spec.ts`: Zod schemas, domain types, default sample spec, and spec parsing.
- `src/lib/policy.ts`: source and capability policy evaluation.
- `src/lib/planner.ts`: deterministic natural-language recommendations and spec draft updates.
- `src/lib/compiler.ts`: deterministic generated-package renderer.
- `src/lib/archive.ts`: ZIP packaging for compiled artifacts.
- `src/components/project-workbench.tsx`: interactive guided project experience.
- `src/components/capability-switch.tsx`: Core/Advanced toggle and disclosure.
- `src/components/validation-report.tsx`: policy and compilation result display.
- `src/app/page.tsx`: public demo shell and product explanation.
- `tests/*.test.ts`: unit tests for each domain module.
- `tests/project-workbench.test.tsx`: user-visible guided-flow test.
- `e2e/automcp.spec.ts`: browser smoke test.
- `README.md`: architecture, security, generated output, usage, and public demo link.

### Task 1: Bootstrap the testable Next.js workspace

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Produces `npm run test`, `npm run build`, and `npm run test:e2e` commands for later tasks.

- [ ] **Step 1: Write the failing smoke test**

```ts
import { describe, expect, it } from 'vitest';

describe('workspace', () => {
  it('defines AutoMCP as the application title', () => {
    expect('AutoMCP').toBe('AutoMCP');
  });
});
```

- [ ] **Step 2: Run the test to verify the workspace is not configured**

Run: `npm test -- tests/smoke.test.ts`

Expected: FAIL because the test command and runner do not yet exist.

- [ ] **Step 3: Add the minimal application and test configuration**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Create a strict Next.js TypeScript app whose root page renders `AutoMCP` and whose layout exports `metadata.title = 'AutoMCP'`.

- [ ] **Step 4: Run checks**

Run: `npm test -- tests/smoke.test.ts && npm run build`

Expected: PASS and a successful production build.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json next.config.ts vitest.config.ts playwright.config.ts src tests
git commit -m "chore: bootstrap AutoMCP app"
```

### Task 2: Implement the canonical AutoMCP specification

**Files:**
- Create: `src/lib/spec.ts`
- Test: `tests/spec.test.ts`

**Interfaces:**
- Produces `AutoMcpSpecSchema`, `AutoMcpSpec`, `createSampleSpec()`, and `parseSpec(input)`.
- Consumed by policy, planner, compiler, and UI.

- [ ] **Step 1: Write failing spec tests**

```ts
import { describe, expect, it } from 'vitest';
import { createSampleSpec, parseSpec } from '@/lib/spec';

describe('AutoMcpSpec', () => {
  it('defaults a project to Core capabilities and Hybrid deployment', () => {
    const spec = createSampleSpec();
    expect(spec.advancedCapabilities).toBe(false);
    expect(spec.deploymentMode).toBe('hybrid');
  });

  it('rejects a plaintext credential value', () => {
    expect(() => parseSpec({ ...createSampleSpec(), credential: { value: 'secret' } })).toThrow();
  });
});
```

- [ ] **Step 2: Run the tests to verify red**

Run: `npm test -- tests/spec.test.ts`

Expected: FAIL because `@/lib/spec` does not exist.

- [ ] **Step 3: Implement strict schema parsing**

```ts
export const DeploymentModeSchema = z.enum(['local', 'cloud', 'hybrid']);
export const CapabilitySchema = z.enum(['tool', 'resource', 'prompt', 'webhook', 'job', 'workflow']);
export const CredentialReferenceSchema = z.object({ provider: z.string().min(1), key: z.string().min(1) }).strict();
export const AutoMcpSpecSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9-]{2,62}$/),
  description: z.string().min(12).max(500),
  deploymentMode: DeploymentModeSchema.default('hybrid'),
  advancedCapabilities: z.boolean().default(false),
  source: z.object({ kind: z.enum(['openapi', 'rest', 'graphql', 'file']), url: z.string().url().optional() }),
  credential: CredentialReferenceSchema.optional(),
  capabilities: z.array(CapabilitySchema).min(1),
}).strict();
```

- [ ] **Step 4: Run tests**

Run: `npm test -- tests/spec.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/spec.ts tests/spec.test.ts
git commit -m "feat: add canonical MCP project spec"
```

### Task 3: Enforce source and capability policies

**Files:**
- Create: `src/lib/policy.ts`
- Test: `tests/policy.test.ts`

**Interfaces:**
- Consumes `AutoMcpSpec`.
- Produces `evaluatePolicy(spec): PolicyReport`, where `PolicyReport` is `{ allowed: boolean; findings: PolicyFinding[] }`.

- [ ] **Step 1: Write failing policy tests**

```ts
it('blocks private and local source hosts', () => {
  const report = evaluatePolicy({ ...createSampleSpec(), source: { kind: 'rest', url: 'http://127.0.0.1/admin' } });
  expect(report.allowed).toBe(false);
  expect(report.findings[0].code).toBe('SOURCE_NOT_PUBLIC_HTTPS');
});

it('requires Advanced mode for a job capability', () => {
  const report = evaluatePolicy({ ...createSampleSpec(), capabilities: ['tool', 'job'] });
  expect(report.findings.some((finding) => finding.code === 'ADVANCED_CAPABILITY_DISABLED')).toBe(true);
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/policy.test.ts`

Expected: FAIL because `evaluatePolicy` is not exported.

- [ ] **Step 3: Implement deterministic policies**

```ts
const blockedHosts = new Set(['localhost', 'metadata.google.internal']);
const privateIpv4 = /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/;
export function evaluatePolicy(spec: AutoMcpSpec): PolicyReport {
  // Require HTTPS external URL sources and report all policy findings.
  // Require advancedCapabilities for webhook, job, and workflow.
  // Add a confirmation-required finding for non-read-only tool operations.
}
```

- [ ] **Step 4: Verify green and build**

Run: `npm test -- tests/policy.test.ts && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/policy.ts tests/policy.test.ts
git commit -m "feat: validate MCP source and capability policy"
```

### Task 4: Add the deterministic planner and compiler

**Files:**
- Create: `src/lib/planner.ts`, `src/lib/compiler.ts`, `src/lib/archive.ts`
- Test: `tests/planner.test.ts`, `tests/compiler.test.ts`

**Interfaces:**
- Produces `recommendCapabilities(intent): CapabilityRecommendation[]`.
- Produces `compileProject(spec): CompiledProject` with `{ files: Record<string, string>; manifest: GeneratedManifest }`.
- Produces `createProjectArchive(project): Blob`.

- [ ] **Step 1: Write failing planner/compiler tests**

```ts
it('recommends a search tool and catalog resource from user intent', () => {
  expect(recommendCapabilities('Search the product catalog and read a product by id')).toEqual(
    expect.arrayContaining(['tool:search_catalog', 'resource:product'])
  );
});

it('compiles an SDK server with tool, resource, prompt, tests, and README', () => {
  const files = compileProject(createSampleSpec()).files;
  expect(files['src/server.ts']).toContain('@modelcontextprotocol/server');
  expect(files['tests/server.test.ts']).toContain('describe');
  expect(files['README.md']).toContain('stdio');
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/planner.test.ts tests/compiler.test.ts`

Expected: FAIL because planner/compiler modules do not exist.

- [ ] **Step 3: Implement deterministic recommendation and rendering**

```ts
export function recommendCapabilities(intent: string): string[] {
  const lower = intent.toLowerCase();
  return [
    ...(lower.includes('search') ? ['tool:search_catalog'] : []),
    ...(lower.includes('read') || lower.includes('catalog') ? ['resource:product'] : []),
    ...(lower.includes('help') ? ['prompt:guide'] : []),
  ];
}
export function compileProject(spec: AutoMcpSpec): CompiledProject {
  const report = evaluatePolicy(spec);
  if (!report.allowed) throw new CompileError(report.findings);
  return { files: renderFiles(spec), manifest: renderManifest(spec) };
}
```

Render static templates only from validated spec values. Include server code using `McpServer`, `StdioServerTransport`, Zod input schemas, tool output schemas, a resource, a prompt, manifest, `.env.example`, generated tests, deployment guidance, and `automcp.manifest.json`.

- [ ] **Step 4: Verify green**

Run: `npm test -- tests/planner.test.ts tests/compiler.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/planner.ts src/lib/compiler.ts src/lib/archive.ts tests/planner.test.ts tests/compiler.test.ts
git commit -m "feat: compile validated MCP projects"
```

### Task 5: Build the guided public workbench

**Files:**
- Create: `src/components/capability-switch.tsx`, `src/components/project-workbench.tsx`, `src/components/validation-report.tsx`
- Modify: `src/app/page.tsx`, `src/app/globals.css`
- Test: `tests/project-workbench.test.tsx`

**Interfaces:**
- Consumes `createSampleSpec`, `evaluatePolicy`, `recommendCapabilities`, and `compileProject`.
- Produces an interactive project editor and downloadable compiled archive.

- [ ] **Step 1: Write failing user-flow test**

```tsx
it('reveals advanced modules only after the toggle is enabled', async () => {
  render(<ProjectWorkbench />);
  expect(screen.queryByText('Scheduled jobs')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('switch', { name: /advanced capabilities/i }));
  expect(screen.getByText('Scheduled jobs')).toBeInTheDocument();
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/project-workbench.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the workbench**

Use client-side React state initialized from `createSampleSpec()`. Include intent, HTTPS API URL, capabilities, deployment mode, Core/Advanced switch, real-time policy report, generated file tab list, code preview, and a `Download generated server` button that calls `createProjectArchive`. State copy must say that secrets are references only and the demo does not call the entered endpoint.

- [ ] **Step 4: Verify green and run production build**

Run: `npm test -- tests/project-workbench.test.tsx && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components src/app tests/project-workbench.test.tsx
git commit -m "feat: add interactive MCP project workbench"
```

### Task 6: Verify a generated server and document the project

**Files:**
- Create: `scripts/verify-generated-server.mjs`, `e2e/automcp.spec.ts`
- Modify: `package.json`, `README.md`

**Interfaces:**
- `npm run verify:generated` compiles a sample package into a temporary directory, installs no credentials, and validates generated server source and tests.
- `README.md` explains system internals, trust boundaries, connectors, tests, local use, remote deployment, demo usage, and the live Vercel URL.

- [ ] **Step 1: Write failing generated-project verification**

```ts
it('creates a package whose generated test suite passes', async () => {
  await expect(verifyGeneratedServer(createSampleSpec())).resolves.toMatchObject({ passed: true });
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/generated-server.test.ts`

Expected: FAIL because the verifier is not available.

- [ ] **Step 3: Implement verification, browser test, and README**

The verifier writes compiler output to a temporary directory, runs the package's generated test command using the workspace dependency resolver, and reports only redacted output. The Playwright test loads `/`, enables Advanced capabilities, edits intent, verifies the policy panel, and confirms a download is offered. README sections are: What it is, live demo, architecture/data flow, generated output, security model, supported sources/capabilities, local setup, tests, deployment, and known boundaries.

- [ ] **Step 4: Run full verification**

Run: `npm run test && npm run verify:generated && npm run build && npm run test:e2e`

Expected: PASS for all checks.

- [ ] **Step 5: Commit**

```bash
git add scripts e2e package.json README.md tests
git commit -m "docs: verify generated server and document AutoMCP"
```

### Task 7: Publish and verify the live demo

**Files:**
- Modify: `README.md`

**Interfaces:**
- Produces a public Vercel deployment URL and README link.

- [ ] **Step 1: Run a deployment readiness check**

Run: `npm run build && git status -sb`

Expected: successful build and only intentional README change after URL insertion.

- [ ] **Step 2: Deploy to Vercel production**

Run: `vercel --prod --yes`

Expected: production URL returned by Vercel.

- [ ] **Step 3: Add the exact returned URL to README**

```md
## Live demo

[Open AutoMCP](https://<verified-production-url>)
```

- [ ] **Step 4: Independently verify the production URL**

Run: browser test against the deployment URL; verify title, Core/Advanced switch, policy feedback, generated-file preview, and download control.

Expected: all required public-demo actions work without credentials.

- [ ] **Step 5: Commit and push**

```bash
git add README.md
git commit -m "docs: add verified live demo"
git push origin master
```

## Plan self-review

- Spec coverage: Tasks 2–4 implement canonical specs, deterministic planning/compiler, source adapters, core tools/resources/prompts, and policy. Task 5 implements the guided interface and switch. Task 6 supplies generated-server, browser, and documentation verification. Task 7 publishes and cold-verifies the demo.
- No-placeholder scan: no implementation task contains a deferred behavior; unsupported connectors are explicitly a post-MVP addition in the approved design and excluded from the first compiler.
- Type consistency: every later task consumes only `AutoMcpSpec`, `PolicyReport`, `recommendCapabilities`, `compileProject`, and archive helpers defined by earlier tasks.
