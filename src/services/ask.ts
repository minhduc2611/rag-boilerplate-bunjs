import { type AskRequest } from "../interfaces";
import { searchDocuments } from "../libs/weaviate";
import { generateAnswer } from "../libs/claude";
export const validateAsk = (body: AskRequest): string[] => {
  const errors: string[] = [];
  if (!body.messages || !Array.isArray(body.messages)) {
    errors.push("messages is required");
  }
  return errors;
};

export const handleAsk = async (body: AskRequest) => {
  // Get the last user message as the query
  const lastUserMessage = body.messages
    .filter((msg) => msg.role === "user")
    .pop();

  if (!lastUserMessage) {
    return new Response(JSON.stringify({ error: "No user message found" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Search for relevant documents
  const relevantDocs = await searchDocuments(lastUserMessage.content);

  const contexts = relevantDocs.map((doc) => ({
    title: doc.properties.title as string,
    content: doc.properties.content as string,
  }));
  console.log(contexts);
  //   Generate answer using Claude
  const answer = await generateAnswer(body.messages, contexts, body.options);
  const sourcesSet = new Set(contexts.map((doc) => doc.title));
  return {
    answer,
    sourcesSet,
  };
};
