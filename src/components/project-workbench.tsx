"use client";

import { useMemo, useState } from "react";
import { createProjectArchive } from "@/lib/archive";
import { compileProject, type CompiledProject } from "@/lib/compiler";
import { evaluatePolicy } from "@/lib/policy";
import { recommendCapabilities } from "@/lib/planner";
import { createSampleSpec, type AutoMcpSpec } from "@/lib/spec";
import { CapabilitySwitch } from "@/components/capability-switch";
import { ValidationReport } from "@/components/validation-report";

export function ProjectWorkbench() {
  const [spec, setSpec] = useState<AutoMcpSpec>(createSampleSpec);
  const [selectedFile, setSelectedFile] = useState("src/server.ts");
  const [notice, setNotice] = useState("");
  const report = useMemo(() => evaluatePolicy(spec), [spec]);
  const compiled = useMemo<CompiledProject | null>(() => { try { return report.allowed ? compileProject(spec) : null; } catch { return null; } }, [report.allowed, spec]);
  const recommendations = useMemo(() => recommendCapabilities(spec.intent), [spec.intent]);

  async function download() {
    if (!compiled) return;
    const blob = await createProjectArchive(compiled);
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href; link.download = `${spec.name}.zip`; link.click(); URL.revokeObjectURL(href);
    setNotice("Generated package downloaded. Credentials are not included.");
  }

  return <section className="workbench" aria-label="AutoMCP project workbench">
    <div className="intake panel">
      <div className="section-heading"><span>1. Define your MCP</span><b className="pill">Spec first</b></div>
      <label>What should the MCP let an agent do?<textarea value={spec.intent} onChange={(event) => setSpec({ ...spec, intent: event.target.value })} /></label>
      <div className="recommendations">Suggested: {recommendations.length ? recommendations.join(" · ") : "Describe search, reading, or guidance to get recommendations."}</div>
      <label>Source endpoint<input value={spec.source.url ?? ""} inputMode="url" onChange={(event) => setSpec({ ...spec, source: { ...spec.source, url: event.target.value } })} /></label>
      <p className="footnote">This demo never calls the endpoint. AutoMCP validates its policy and generates a connector package locally in your browser.</p>
      <div className="modes"><span>Deployment</span>{(["local", "hybrid", "cloud"] as const).map((mode) => <button key={mode} type="button" className={spec.deploymentMode === mode ? "active" : ""} onClick={() => setSpec({ ...spec, deploymentMode: mode })}>{mode}</button>)}</div>
      <CapabilitySwitch enabled={spec.advancedCapabilities} onChange={(advancedCapabilities) => setSpec({ ...spec, advancedCapabilities })} />
      {spec.advancedCapabilities && <div className="advanced"><strong>Advanced module surface</strong><span>Webhooks</span><span>Scheduled jobs</span><span>Workflow connectors</span><p>Each advanced module adds an explicit permission and dry-run review before compilation.</p></div>}
    </div>
    <div className="output-stack">
      <ValidationReport report={report} />
      <section className="panel files"><div className="section-heading"><span>Generated package</span><b className="ok">Deterministic</b></div>
        {compiled ? <><div className="file-tabs">{Object.keys(compiled.files).map((file) => <button type="button" key={file} className={selectedFile === file ? "active" : ""} onClick={() => setSelectedFile(file)}>{file}</button>)}</div><pre>{compiled.files[selectedFile]}</pre><button className="download" type="button" onClick={download}>Download generated server</button></> : <p className="muted">Resolve policy errors to inspect the generated package.</p>}
        {notice && <p className="notice">{notice}</p>}
      </section>
    </div>
  </section>;
}
