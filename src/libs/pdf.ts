import pdf from "pdf-parse";

export async function extractTextFromPDF(buffer: Buffer) {
  const data = await pdf(buffer);
  return data;
}

export function chunkText(text: string, maxTokens = 500) {
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks = [];
  let chunk = "";

  for (const sentence of sentences) {
    if ((chunk + sentence).split(" ").length > maxTokens) {
      chunks.push(chunk.trim());
      chunk = sentence;
    } else {
      chunk += " " + sentence;
    }
  }
  if (chunk) chunks.push(chunk.trim());
  return chunks;
}
