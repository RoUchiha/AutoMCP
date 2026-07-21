# AutoMCP design specification

## Purpose

AutoMCP is a spec-driven application that converts a user’s intent and an API or data source into a secure, typed, runnable Model Context Protocol (MCP) server. It is designed for developers and technical operators who want a working connector without hand-writing the protocol plumbing.

The product’s source of truth is an explicit, versioned `AutoMcpSpec`. AI helps draft and refine that spec; deterministic validation and compilation are the only path to generated code. This separation makes the generated capability reviewable, testable, and portable.

## Product boundary

### Core mode (default)

Core mode covers API and data MCPs. A project can ingest OpenAPI documents, REST endpoints, GraphQL endpoints, SQL read models, CSV, JSON, and JSON Lines. It produces:

- MCP tools for mutations, lookups, searches, and actions.
- MCP resources and URI templates for read-only contextual data.
- MCP prompts for repeatable interaction templates.
- Typed input and output schemas, generated from source contracts and refined by the user.
- Local `stdio` and remote Streamable HTTP deployment targets.
- Connection instructions for compatible MCP clients.

### Advanced capabilities (switchable)

Every project has a persistent `advancedCapabilities` boolean. Switching it on reveals and enables optional modules; it does not fork, rewrite, or invalidate the project’s core spec.

- Webhook triggers and verification rules.
- Scheduled jobs with idempotency requirements.
- Declarative transform pipelines and custom logic adapters.
- Multi-connector workflows and integration templates.
- Additional execution controls: dry runs, explicit confirmation requirements, egress policy reviews, and per-module permission grants.

The compiler always reads a single canonical spec. Advanced-only sections are rejected while the switch is off and validated more strictly while it is on.

## Architecture

1. **Web application (control plane).** A Next.js application provides the guided intake, plain-language drafting, spec editor, validation report, generated-file explorer, test report, artifact download, and deployment instructions. The public demo has no real customer credentials.
2. **Planner.** An AI-backed planner translates natural language into a proposed `AutoMcpSpec` patch. It never emits executable code directly and cannot bypass validation. Prompt input and tool results are treated as untrusted data.
3. **Spec engine.** Zod schemas validate the project, source descriptor, capabilities, credential references, policy, and deployment target. A normalization step resolves naming, schemas, idempotency, pagination, and read/write risk classifications.
4. **Policy engine.** Deterministic rules assess source reachability, SSRF risk, allowed hosts, forbidden private address ranges, tool risk, requested OAuth scopes, mutation confirmation requirements, and advanced-mode policy.
5. **Compiler.** A template-based compiler produces a standalone TypeScript package using the official MCP SDK, Zod schemas, structured tool output, and an adapter chosen by the source type. The compiler also generates unit tests, contract tests, a manifest, environment-variable template, and client connection instructions.
6. **Connector runtime.** Source adapters implement one plug-and-play contract: discovery, credential requirements, schema mapping, request execution, health check, and test fixture support. This allows REST/OpenAPI, GraphQL, SQL, file, webhook, and future SaaS connectors to plug in without changing the core compiler.
7. **Deployment targets.** Local builds use `stdio`. Remote builds use Streamable HTTP with OAuth-ready configuration. The first hosted demo deploys the AutoMCP control plane to Vercel; generated remote servers receive provider-neutral deployment assets, with Cloudflare Workers offered as the preferred production remote-MCP target because its remote OAuth model is mature.

## Generated MCP contract

The generated server uses the official TypeScript SDK and emits MCP tools, resources, and prompts independently. Tool schemas use Zod and include descriptions, examples, input validation, output schemas, and stable names. The server supports `stdio` for local use and Streamable HTTP for remote use. Legacy SSE is not selected for new projects.

Each generated project contains:

- `src/server.ts` for MCP registration and transport bootstrap.
- `src/connectors/<connector>.ts` for upstream access.
- `src/policy.ts` for runtime guards.
- `src/schemas.ts` for contracts.
- `tests/` for unit, contract, and generated fixture tests.
- `automcp.manifest.json` for capabilities, scopes, source domains, and deployment metadata.
- `.env.example`, a README, and MCP client configuration snippets.

## Security model

AutoMCP follows least privilege and assumes all API descriptions, fetched metadata, and LLM-generated proposals can be malicious or wrong.

- Secrets never enter `AutoMcpSpec`, generated source, logs, or the public demo. Specs store opaque credential references; deployments resolve secrets through environment variables or a user-selected secret provider.
- The discovery and generated runtime enforce HTTPS, DNS/IP address checks, private-network blocks, redirect limits, host allowlists, request timeouts, response-size limits, and method restrictions to mitigate SSRF.
- Tool classification determines consent behavior: read-only tools can run normally; mutations require an explicit confirmation-capable host and are marked destructive in their metadata; high-risk advanced operations default to dry run.
- The remote endpoint validates Host headers, rate-limits requests, emits structured audit events, redacts secrets/authorization headers, and returns safe operational errors.
- Remote authentication uses OAuth 2.1 authorization-code flow with PKCE, protected-resource and authorization-server discovery, short-lived tokens, and audience validation. An MCP client token is never passed to an upstream API; the upstream connector obtains its own scoped credential.
- Supply-chain hygiene includes lockfiles, pinned template versions, generated artifact manifests, dependency auditing, secret scanning, and a human-readable capability review before release.

## User workflow

1. Create a project and choose Local, Cloud, or Hybrid deployment. Hybrid is preselected.
2. Paste an OpenAPI URL/document, REST/GraphQL endpoint, SQL configuration, or upload a data file. File parsing occurs locally in the browser where possible; no uploaded file is retained by the demo.
3. Describe the intended capability in natural language and select tools, resources, prompts, or let AutoMCP recommend them.
4. Review the AI-proposed spec diff, source access policy, credentials needed, tools, scopes, and risk labels.
5. Validate the spec, inspect generated code and tests, then download the project or follow deployment instructions.
6. Switch on Advanced capabilities at any time to add webhooks, jobs, transforms, or multi-connector flows. Review the added permissions and policies before recompiling.

## Industry-aligned choices

- Preserve the protocol’s separation between JSON-RPC primitives and transport: the same spec can render to local `stdio` or remote Streamable HTTP.
- Prefer Streamable HTTP for new remote deployments; retain `stdio` for excellent local developer experience.
- Make OAuth the remote default, with scoped access and resource/audience binding rather than broad personal tokens.
- Use progressive capability availability: tool visibility reflects both configured project policy and available credential scopes.
- Generate typed contracts and tests with every server instead of relying on model-generated source code at runtime.
- Expose a clear local-to-remote bridge path for older hosts that need it, while keeping remote OAuth support first-class.

## Initial implementation milestones

1. Build the typed spec, parser, policy engine, and compiler for OpenAPI/REST plus a mocked data connector.
2. Build the Next.js guided flow, Core/Advanced switch, project persistence in browser storage, code explorer, download, and sample project.
3. Generate an actual local `stdio` MCP package with tools, resources, prompts, tests, and connection instructions.
4. Add Streamable HTTP artifacts and a Cloudflare Worker deployment template; deploy the AutoMCP control-plane demo to Vercel.
5. Add GraphQL, file normalization, and advanced webhook/job plugins behind the switch.

## Validation strategy

- Unit tests: spec parsing, schema mapping, name normalization, policy decisions, connector contracts, and template rendering.
- Contract tests: compile sample specs and exercise generated MCP handlers against mocked upstreams.
- Integration tests: run a generated `stdio` server and call it through an MCP client test harness.
- End-to-end tests: use the browser flow to create and validate a sample OpenAPI project, generate the artifact, and verify download contents.
- Security tests: reject private endpoints, unsafe redirects, unknown credential fields, unapproved mutation tools, token-passthrough attempts, and advanced sections when the switch is disabled.

## Success criteria

The public demo lets an anonymous visitor turn the included sample OpenAPI source into a downloadable, tested MCP server package and understand exactly where code, credentials, and execution occur. The repository contains a thorough README, architecture documentation, test totals, client connection instructions, and the verified demo URL. No demo claim is made for operations that require a user’s credentials or cloud account.
