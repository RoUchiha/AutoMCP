# AutoMCP

> A spec-driven, security-first compiler for MCP server packages.

## Live demo

Deployment in progress. The verified production URL will be added here before this branch is merged.

## What it does

AutoMCP takes a human description, a data/API source, a deployment preference, and the MCP capabilities you want. It produces a canonical typed specification, a policy report, and a downloadable TypeScript package that implements an MCP server.

The public application is intentionally transparent: it never calls the endpoint you paste and never receives a credential. It demonstrates real specification validation and real package compilation in-browser. A generated package uses the official stable `@modelcontextprotocol/sdk` API, `stdio` transport, Zod schemas, tools, resources, prompts, a manifest, tests, environment template, and deployment guidance.

## System flow

```text
Intent + source + deployment choice
            |
            v
  deterministic capability recommender
            |
            v
     typed AutoMcpSpec (Zod)
            |
     +------v-------+
     | policy engine |
     +------+-------+
            |
            v
 template compiler -> server.ts + manifest + tests + docs -> ZIP download
```

### Components

| Component | Responsibility |
| --- | --- |
| `src/lib/spec.ts` | The canonical, strict `AutoMcpSpec` and safe sample source. |
| `src/lib/planner.ts` | Deterministic intent-to-capability suggestions. It is advisory only. |
| `src/lib/policy.ts` | Blocks unsafe source hosts and prevents Advanced capabilities from compiling while disabled. |
| `src/lib/compiler.ts` | Renders static TypeScript MCP artifacts only from validated values. |
| `src/lib/archive.ts` | Creates a client-side ZIP; no generated project data is retained. |
| `src/components/*` | Guided Core/Advanced workbench, validation feedback, and artifact preview. |

## Core and Advanced capabilities

Core mode is the default and includes tools, resources, prompts, API/data sources, typed contracts, and Local/Cloud/Hybrid deployment choices. The **Advanced capabilities** switch can be enabled at any time without creating a second project spec. It exposes the policy surface for webhooks, scheduled jobs, and workflows; those modules are deliberately not compiled until separately implemented and approved.

## Connector contract

AutoMCP's next connector adapters implement one interface: source discovery, credential-reference requirements, schema mapping, request execution, health checks, and deterministic fixtures. The current compiler emits a safe REST/OpenAPI-shaped package template. GraphQL, SQL, file normalization, webhooks, and jobs are planned connector modules—kept behind the Advanced switch rather than claimed as working today.

## Security model

- Credentials are references such as `environment:CATALOG_API_TOKEN`, never values. They are excluded from specs, manifests, logs, ZIP files, and the demo.
- The policy engine blocks non-HTTPS sources, `localhost`, private IPv4 ranges, link-local/metadata service hosts, and advanced modules while their switch is disabled.
- Write operations are marked confirmation-required in the generated manifest.
- The generated deployment guide requires Streamable HTTP, OAuth 2.1 + PKCE, host-header validation, audience validation, redacted logging, and separate upstream credentials. Never forward an MCP client token to an upstream API.
- Dependencies are pinned and audited. The project currently forces a patched PostCSS release because the compatible Next.js release otherwise pins a vulnerable transitive version.

## Run locally

```bash
git clone https://github.com/RoUchiha/AutoMCP.git
cd AutoMCP
npm install
npm run dev
```

Open `http://localhost:3000`. Enter an HTTPS API endpoint, describe the desired agent behavior, examine the policy report, and download the generated package. The demo does not contact your endpoint.

## Generated package

The ZIP contains:

- `src/server.ts` — `McpServer`, `StdioServerTransport`, typed tools, resource, and prompt.
- `src/policy.ts` — source host and opaque credential reference.
- `tests/server.test.ts` — generated test starter.
- `automcp.manifest.json` — tool risk labels, capability list, source host, and credential reference.
- `.env.example` — source configuration only; never a real secret.
- `DEPLOYMENT.md` — remote Streamable HTTP/OAuth security checklist.

Install its dependencies, set environment variables locally, and connect the command with an MCP host using stdio. For remote use, deploy it behind an OAuth 2.1-capable Streamable HTTP runtime and follow the generated `DEPLOYMENT.md`.

## Verification

```bash
npm test          # unit + component tests
npm run build     # production compilation and TypeScript checks
npm run test:e2e  # browser journey
npm audit --omit=dev
```

Current test suite covers strict specs, secret rejection, source and capability policy, deterministic compilation, intent recommendation, and the Core-to-Advanced UI flow.

## Truthful scope

AutoMCP is a real spec validator and code compiler, not an execution proxy. It does not authenticate to, call, or deploy user sources from the public demo. Deploying a generated remote MCP server still requires the user to configure a cloud account and credential provider. That boundary is deliberate: it prevents the demo from handling untrusted credentials or arbitrary network access.

## Standards used

- [Model Context Protocol architecture](https://modelcontextprotocol.io/docs/learn/architecture)
- [MCP authorization specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)
- [MCP security best practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)
- [Official TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
