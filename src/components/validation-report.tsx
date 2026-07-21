import type { PolicyReport } from "@/lib/policy";

export function ValidationReport({ report }: { report: PolicyReport }) {
  return <section className="panel validation" aria-live="polite">
    <div className="section-heading"><span>Policy report</span><b className={report.allowed ? "ok" : "blocked"}>{report.allowed ? "Ready to compile" : "Needs attention"}</b></div>
    {report.findings.length === 0 ? <p className="muted">Source policy, capabilities, and operation risk checks passed.</p> : <ul>{report.findings.map((finding) => <li key={finding.code} className={finding.severity}>{finding.message}</li>)}</ul>}
  </section>;
}
