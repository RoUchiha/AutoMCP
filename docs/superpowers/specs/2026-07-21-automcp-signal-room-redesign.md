# AutoMCP Signal Room UI Redesign

**Status:** Approved visual direction; awaiting written-spec review

## Purpose

Replace the current dark, terminal-like AutoMCP workbench with **Signal Room**: a warm, editorial product surface that makes the MCP creation path immediately legible. The application remains a truthful, client-side spec compiler; this is a user-interface redesign, not a change to its security model, compiler contracts, or deployment behavior.

## Experience principles

- Use a cobalt outer field and a warm, paper-like workspace to separate product identity from the work surface.
- Lead with a human editorial display face and a clear humanist interface face. Reserve monospace for compact technical metadata only.
- Show the creation sequence explicitly: **Intent → Source → Policy → Package**.
- Explain each decision where it is made, especially source access and security policy.
- Make the generated result auditable: describe what will be packaged using facts derived from the current spec and validation report.

## Information architecture

The page keeps its existing one-screen workbench, rearranged into a clear flow:

1. **Header and progress rail** — AutoMCP identity, deployment-mode control, and a four-step progress rail with a one-line explanation for each step. The rail is descriptive rather than a gated wizard, so users can still revise any input at any time.
2. **Intent** — the natural-language MCP description stays the primary input, with an explicit explanation that AutoMCP uses it to propose capabilities.
3. **Source** — endpoint/data-source input and authentication posture. The UI states that the demo validates the source policy but does not call the user endpoint or retain secrets.
4. **MCP surface and policy** — a readable summary of Tools, Resources, and Prompts; the existing Advanced capability on/off switch remains available and continues to control webhook, scheduled-job, and custom-workflow suggestions.
5. **Capability map** — a right-side, fact-based map of contracts, source access, guardrails, and output package. It is built from the canonical spec, policy report, and compiler manifest rather than fictional activity.
6. **Build receipt** — a compact final status area showing validation state, generated operation count, selected transport/deployment behavior, and the download action.

On narrow screens, the right-side capability map and receipt move below the form while preserving the input order.

## Visual system

- **Canvas:** deep ultramarine blue outside a high-contrast cream work surface.
- **Accents:** cobalt for structure and selection, vermilion for the primary compile/download action, lime as a restrained validation/status signal.
- **Typography:** an editorial serif stack (`Georgia`, `Cambria`, serif) for display headings, and a humanist system sans stack for controls and body copy. Monospace is limited to source/transport metadata.
- **Components:** square-to-gently-rounded cards, fine rules, concise labels, and visible focus states. Avoid pill-heavy dashboards, neon gradients, glass effects, terminal framing, and dense icon-only controls.
- **Motion:** no decorative animation. State changes use short, accessible transitions and respect reduced-motion preferences.

## Functional behavior

The redesign preserves existing product behavior:

- Local, Cloud, and Hybrid deployment modes remain selectable, with Hybrid as the initial selection.
- The Advanced capabilities control remains a simple on/off switch and retains its current safety policy behavior.
- Capability suggestions and compiled output continue to be deterministic from the user-entered canonical spec.
- Invalid or unsafe sources remain blocked by the existing policy layer. Writes remain confirmation-required in generated artifacts.
- The primary action continues to generate and download the MCP server package in-browser; it does not deploy, call, or store user endpoints.

The visible receipt must use precise language. For example, it may state the actual number of generated operations or that policy and contract checks have completed, but it must not claim network validation, generated test counts, live provisioning, or secret storage that the application does not perform.

## Component boundaries

- `page.tsx` owns the page shell and immutable product framing.
- `project-workbench.tsx` owns editable spec state, user interactions, capability summaries, policy feedback, and package download.
- Small presentational subcomponents may be extracted when they make the workbench easier to test: progress rail, source summary, capability map, and build receipt should each receive typed data rather than reach into compiler state.
- `capability-switch.tsx` remains the accessible Advanced on/off interaction.
- Existing policy, planner, compiler, schema, and archive modules remain unchanged unless a UI requirement exposes a genuine contract gap.

## Error handling and accessibility

- Keep validation and policy errors adjacent to the affected workflow stage and in the existing validation report.
- Preserve native labels and keyboard-operable controls; add explicit accessible names to visual cards and status indicators.
- Maintain readable color contrast across blue, cream, cobalt, vermilion, and lime treatments.
- Do not make color the sole signal for a blocked, warning, or ready state.

## Test and validation strategy

1. Add or update a component test before the redesign implementation to assert the visible four-step flow, source/policy explanations, and factual build receipt.
2. Preserve the Advanced switch test and add coverage that the revised layout still exposes advanced-only suggestions only after opt-in.
3. Run the full Vitest suite, production build, and production dependency audit.
4. Deploy the merged result to the existing Vercel project and validate the live demo as an anonymous visitor, including the deployment selector, Advanced switch, and download action.
5. Compare the rendered production surface to this Signal Room spec and correct material visual or flow regressions before completion.

## Non-goals

- No real connector credential vault, endpoint invocation, server hosting, or auto-deployment is added in this redesign.
- No external design asset, Figma file, unrelated SaaS connector, or new UI library is required.
- No change to the public API of the generated MCP package is intended.
