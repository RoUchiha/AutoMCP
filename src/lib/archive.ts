import JSZip from "jszip";
import type { CompiledProject } from "@/lib/compiler";

export async function createProjectArchive(project: CompiledProject): Promise<Blob> {
  const archive = new JSZip();
  Object.entries(project.files).forEach(([name, contents]) => archive.file(name, contents));
  return archive.generateAsync({ type: "blob" });
}
