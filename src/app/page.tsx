import { ProjectWorkbench } from "@/components/project-workbench";

export default function Home() {
  return <main className="site-shell">
    <header className="hero">
      <div className="product-line"><span className="wordmark">AutoMCP</span><span>Signal Room / v0.1</span></div>
      <div className="hero-copy">
        <div>
          <p className="eyebrow">SPEC-DRIVEN MCP CREATION</p>
          <h1>A clearer way to shape what your agent can safely do.</h1>
        </div>
        <p>Start with intent, name a source, choose a policy posture, and take away a deterministic MCP package. The demo never invokes your endpoint or stores a secret.</p>
      </div>
      <div className="trust" aria-label="Product guarantees"><span>Deterministic output</span><span>External secrets</span><span>Policy before package</span></div>
    </header>
    <ProjectWorkbench />
  </main>;
}
