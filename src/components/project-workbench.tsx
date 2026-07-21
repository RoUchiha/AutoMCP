"use client";

import { useMemo, useState } from "react";
import { CapabilitySwitch } from "@/components/capability-switch";
import { ValidationReport } from "@/components/validation-report";
import { createProjectArchive } from "@/lib/archive";
import { compileProject, type CompiledProject } from "@/lib/compiler";
import { evaluatePolicy, type PolicyReport } from "@/lib/policy";
import { recommendCapabilities } from "@/lib/planner";
import { createSampleSpec, type AutoMcpSpec } from "@/lib/spec";

const workflow = [
  ["01", "Intent", "Describe the outcome"],
  ["02", "Source", "Name the boundary"],
  ["03", "Policy", "Choose safe execution"],
  ["04", "Package", "Inspect and download"],
] as const;

const surfaceLabels: Record<AutoMcpSpec["capabilities"][number], string> = {
  tool: "Tools",
  resource: "Resources",
  prompt: "Prompts",
  webhook: "Webhooks",
  job: "Scheduled jobs",
  workflow: "Workflows",
};

function StageHeading({ number, title, detail }: { number: string; title: string; detail: string }) {
  return <div className="stage-heading">
    <span className="stage-kicker">{number} / {title}</span>
    <h2>{detail}</h2>
  </div>;
}

function WorkflowRail() {
  return <nav className="workflow-rail" aria-label="MCP creation workflow">
    <ol>
      {workflow.map(([number, title, detail]) => <li key={title}>
        <span>{number}</span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </li>)}
    </ol>
  </nav>;
}

function CapabilityMap({ spec, report, compiled }: { spec: AutoMcpSpec; report: PolicyReport; compiled: CompiledProject | null }) {
  const sourceHost = compiled?.manifest.sourceHost ?? "Awaiting an approved source";
  const credential = compiled?.manifest.credentialReference ?? "No credential reference";

  return <aside className="capability-map panel" aria-labelledby="capability-map-title">
    <div className="section-heading">
      <span id="capability-map-title">Capability map</span>
      <b className={report.allowed ? "ok" : "blocked"}>{report.allowed ? "Guardrails ready" : "Policy hold"}</b>
    </div>
    <p className="map-intro">A readable contract for what the generated server exposes and what it deliberately leaves external.</p>
    <dl>
      <div><dt>Contracts</dt><dd>{spec.capabilities.map((capability) => surfaceLabels[capability]).join(" · ")}</dd></div>
      <div><dt>Source access</dt><dd>{sourceHost}</dd></div>
      <div><dt>Permissions</dt><dd>{report.allowed ? "Read operations are ready; writes require confirmation." : "Resolve the policy report before packaging."}</dd></div>
      <div><dt>Credentials</dt><dd>{credential} — external only</dd></div>
    </dl>
  </aside>;
}

function BuildReceipt({ report, compiled, spec, notice }: { report: PolicyReport; compiled: CompiledProject | null; spec: AutoMcpSpec; notice: string }) {
  const transport = spec.deploymentMode === "local" ? "stdio transport" : spec.deploymentMode === "cloud" ? "Streamable HTTP guidance" : "stdio package + remote guidance";
  const operationCount = compiled?.manifest.operations.length ?? 0;

  return <section className="build-receipt" aria-live="polite" aria-label="Build receipt">
    <div>
      <span className="receipt-label">Build receipt</span>
      <strong>{report.allowed ? "Policy and contract checks complete" : "Policy review required"}</strong>
    </div>
    <div><b>{operationCount} operations generated</b><span>{transport}</span></div>
    {notice && <p className="notice">{notice}</p>}
  </section>;
}

export function ProjectWorkbench() {
  const [spec, setSpec] = useState<AutoMcpSpec>(createSampleSpec);
  const [selectedFile, setSelectedFile] = useState("src/server.ts");
  const [notice, setNotice] = useState("");
  const report = useMemo(() => evaluatePolicy(spec), [spec]);
  const compiled = useMemo<CompiledProject | null>(() => {
    try { return report.allowed ? compileProject(spec) : null; } catch { return null; }
  }, [report.allowed, spec]);
  const recommendations = useMemo(() => recommendCapabilities(spec.intent), [spec.intent]);

  async function download() {
    if (!compiled) return;
    const blob = await createProjectArchive(compiled);
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${spec.name}.zip`;
    link.click();
    URL.revokeObjectURL(href);
    setNotice("Generated package downloaded. Credentials are not included.");
  }

  return <section className="signal-room" aria-label="AutoMCP project workbench">
    <WorkflowRail />
    <div className="signal-grid">
      <div className="signal-form">
        <section className="signal-stage" aria-labelledby="intent-stage-title">
          <StageHeading number="01" title="Intent" detail="Describe what your agent should be able to do." />
          <label htmlFor="mcp-intent">Desired capability</label>
          <textarea id="mcp-intent" value={spec.intent} onChange={(event) => setSpec({ ...spec, intent: event.target.value })} />
          <p className="stage-note">AutoMCP uses this description to propose a conservative MCP surface; you stay in control of the canonical spec.</p>
          <div className="recommendations" aria-label="Suggested capabilities">
            <span>Suggested surfaces</span>
            {recommendations.length ? recommendations.map((recommendation) => <b key={recommendation}>{recommendation}</b>) : <p>Describe search, reading, or guidance to get recommendations.</p>}
          </div>
        </section>

        <section className="signal-stage" aria-labelledby="source-stage-title">
          <StageHeading number="02" title="Source" detail="Connect the information your agent may use." />
          <label htmlFor="source-endpoint">API or data source endpoint</label>
          <input id="source-endpoint" value={spec.source.url ?? ""} inputMode="url" onChange={(event) => setSpec({ ...spec, source: { ...spec.source, url: event.target.value } })} />
          <div className="source-context">
            <span>Source type: {spec.source.kind}</span>
            <span>Auth: environment reference</span>
          </div>
          <p className="stage-note">This demo does not call your endpoint or retain credentials. It checks source policy locally and packages a connector contract in your browser.</p>
        </section>

        <section className="signal-stage policy-stage" aria-labelledby="policy-stage-title">
          <StageHeading number="03" title="Policy" detail="Decide where the server runs and which advanced surfaces are allowed." />
          <div className="mode-control" aria-label="Deployment mode">
            <span>Deployment posture</span>
            <div>{(["local", "hybrid", "cloud"] as const).map((mode) => <button key={mode} type="button" aria-pressed={spec.deploymentMode === mode} className={spec.deploymentMode === mode ? "active" : ""} onClick={() => setSpec({ ...spec, deploymentMode: mode })}>{mode}</button>)}</div>
          </div>
          <CapabilitySwitch enabled={spec.advancedCapabilities} onChange={(advancedCapabilities) => setSpec({ ...spec, advancedCapabilities })} />
          {spec.advancedCapabilities && <div className="advanced" aria-label="Advanced module surface">
            <strong>Advanced module surface</strong>
            <span>Webhooks</span><span>Scheduled jobs</span><span>Workflow connectors</span>
            <p>Each advanced module adds an explicit permission and dry-run review before compilation.</p>
          </div>}
          <ValidationReport report={report} />
        </section>
      </div>

      <div className="package-column">
        <CapabilityMap spec={spec} report={report} compiled={compiled} />
        <section className="signal-stage package-stage" aria-labelledby="package-stage-title">
          <StageHeading number="04" title="Package" detail="Review the generated server before you take it with you." />
          <BuildReceipt report={report} compiled={compiled} spec={spec} notice={notice} />
          {compiled ? <>
            <div className="file-tabs" aria-label="Generated package files">{Object.keys(compiled.files).map((file) => <button type="button" key={file} className={selectedFile === file ? "active" : ""} onClick={() => setSelectedFile(file)}>{file}</button>)}</div>
            <pre aria-label={`Preview of ${selectedFile}`}>{compiled.files[selectedFile]}</pre>
            <button className="download" type="button" onClick={download}>Compile &amp; download server</button>
          </> : <p className="muted">Resolve policy errors to inspect the generated package.</p>}
        </section>
      </div>
    </div>
  </section>;
}
