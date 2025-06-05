import { serve } from "bun";
import { config } from "dotenv";
import { logger } from "./libs/logger";
import { initializeSchema } from "./libs/weaviate";
import { handleAsk, validateAsk } from "./services/ask";
import { handleUploadDocument, validateUploadDocument } from "./services/upload-document";

// Load environment variables
config();

// Initialize Weaviate schema
await initializeSchema();

// Request body types

// Start the server
serve({
  port: parseInt(process.env.PORT || "3000"),
  async fetch(req) {
    const url = new URL(req.url);

    try {
      // Handle CORS
      if (req.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }
      logger.log(url.pathname);
      // Handle upload documents endpoint
      if (
        url.pathname === "/api/v1/upload-documents" &&
        req.method === "POST"
      ) {
        const formData = await req.formData();
        logger.log("upload-documents");
        const files = formData.getAll("files") as File[];
        const description = formData.get("description") as string;
        const payload = {
          files,
          description,
        };
        const errors = validateUploadDocument(payload);
        if (errors.length > 0) {
          return new Response(
            JSON.stringify({ error: errors.join(", ") }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        const results = await handleUploadDocument(payload);
        return new Response(
          JSON.stringify({
            message: "Documents uploaded successfully",
            results,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // Handle ask endpoint
      if (url.pathname === "/api/v1/ask" && req.method === "POST") {
        const body = await req.json();
        logger.log(body);
        const errors = validateAsk(body);
        if (errors.length > 0) {
          return new Response(
            JSON.stringify({ error: errors.join(", ") }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        const result = await handleAsk(body);

        return new Response(JSON.stringify({ result }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle 404
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(error);
      // logger.error(`Error handling request: ${error} \n ${}`);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

logger.info(`Server running at http://localhost:${process.env.PORT || 3000}`);
