import type { AutoMcpSpec, Capability } from "@/lib/spec";

export type PolicyCode = "SOURCE_NOT_PUBLIC_HTTPS" | "ADVANCED_CAPABILITY_DISABLED" | "WRITE_CONFIRMATION_REQUIRED" | "MISSING_SOURCE_URL";
export type PolicyFinding = { code: PolicyCode; severity: "error" | "warning"; message: string };
export type PolicyReport = { allowed: boolean; findings: PolicyFinding[] };

const advanced: Capability[] = ["webhook", "job", "workflow"];
const privateIpv4 = /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[0-1])\.)/;

function sourceIsSafe(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname !== "localhost" && !privateIpv4.test(parsed.hostname) && parsed.hostname !== "metadata.google.internal";
  } catch {
    return false;
  }
}

export function evaluatePolicy(spec: AutoMcpSpec): PolicyReport {
  const findings: PolicyFinding[] = [];
  if (spec.source.kind !== "file" && (!spec.source.url || !sourceIsSafe(spec.source.url))) {
    findings.push({ code: "SOURCE_NOT_PUBLIC_HTTPS", severity: "error", message: "External sources must use a public HTTPS host; local, private, and metadata endpoints are blocked." });
  }
  if (!spec.advancedCapabilities && spec.capabilities.some((capability) => advanced.includes(capability))) {
    findings.push({ code: "ADVANCED_CAPABILITY_DISABLED", severity: "error", message: "Enable Advanced capabilities before adding webhooks, jobs, or workflows." });
  }
  if (spec.operations.some((operation) => operation.kind === "write")) {
    findings.push({ code: "WRITE_CONFIRMATION_REQUIRED", severity: "warning", message: "Write operations are generated as confirmation-required destructive tools." });
  }
  return { allowed: !findings.some((finding) => finding.severity === "error"), findings };
}
