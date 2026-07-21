import { ProjectWorkbench } from "@/components/project-workbench";

export default function Home() {
  return <main>
    <header className="hero"><div className="eyebrow">SPEC-DRIVEN MCP COMPILER</div><h1>Build the connector your agent actually needs.</h1><p>AutoMCP turns a safe API or data-source specification into a typed, tested MCP server—with security policy as part of compilation.</p><div className="trust"><span>Official SDK output</span><span>Local + remote ready</span><span>Secrets stay external</span></div></header>
    <ProjectWorkbench />
  </main>;
}
