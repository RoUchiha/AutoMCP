export function recommendCapabilities(intent: string): string[] {
  const value = intent.toLowerCase();
  const recommendations: string[] = [];
  if (value.includes("search")) recommendations.push("tool:search_catalog");
  if (value.includes("read") || value.includes("catalog") || value.includes("product")) recommendations.push("resource:product");
  if (value.includes("guide") || value.includes("help")) recommendations.push("prompt:guide");
  return recommendations;
}
