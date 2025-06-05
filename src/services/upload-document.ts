import { type UploadDocumentsRequest } from "../interfaces";
import { chunkText, extractTextFromPDF } from "../libs/pdf";
import { uploadDocuments } from "../libs/weaviate";

export const validateUploadDocument = (body: UploadDocumentsRequest): string[] => {
  const errors: string[] = [];
  if (!body.files || !Array.isArray(body.files)) {
    errors.push("files is required");
  }
  // file must be PDF 
  if (!body.files.every((file) => file.type === "application/pdf")) {
    errors.push(`file must be PDF`);
  }
  return errors;
};
export async function handleUploadDocument(payload: UploadDocumentsRequest) {
  const promises = payload.files.map(async (file) => {
    const dataBuffer = Buffer.from(await file.arrayBuffer());
    const pages = await extractTextFromPDF(dataBuffer);
    const chunks = chunkText(pages.text, 1000); // adjust size
    const title = file.name;
    const documents = chunks.map((chunk) => ({
      title: title,
      content: chunk,
    }));
    const result = await uploadDocuments(documents);
    return result;
  });
  const results = await Promise.all(promises);
  return results;
}
