import JSZip from "jszip";
import type { ExportResult } from "./index";

export async function createZipBlob(result: ExportResult): Promise<Blob> {
  const zip = new JSZip();

  for (const file of result.files) {
    zip.file(file.path, file.content);
  }

  return zip.generateAsync({ type: "blob" });
}
