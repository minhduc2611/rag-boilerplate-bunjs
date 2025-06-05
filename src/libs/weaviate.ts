import weaviate, {
  type BatchObjectsReturn,
  type WeaviateClient,
  type WeaviateNonGenericObject,
} from "weaviate-client";

const weaviateURL = process.env.WEAVIATE_URL as string;
const weaviateApiKey = process.env.WEAVIATE_API_KEY as string;
const embeddingModel = process.env.EMBEDDING_MODEL as string;
const openaiApiKey = process.env.OPENAI_API_KEY as string;

const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
  weaviateURL,
  {
    authCredentials: new weaviate.ApiKey(weaviateApiKey),
    headers: {
      "X-OpenAI-Api-Key": openaiApiKey, // Replace with your inference API key
    },
  }
);

const collectionName = "Documents";

// Initialize schema if it doesn't exist
export async function initializeSchema(): Promise<void> {
  // try {
  //   // await checkConnection();
  //   const schema = await client.schema.getter().do();
  //   const exists = schema.classes?.some((c) => c.class === "Document");
  //   if (!exists) {
  //     await client.schema.classCreator().withClass(documentSchema).do();
  //     console.log("Document schema created successfully");
  //   }
  // } catch (error) {
  //   console.error("Error initializing schema:", error);
  //   throw error;
  // }
  const exists = await client.collections.exists(collectionName);
  if (!exists) {
    await client.collections.create({
      name: collectionName,
      properties: [
        {
          name: "title",
          dataType: "text" as const,
        },
        {
          name: "content",
          dataType: "text" as const,
        },
      ],
      vectorizers: [
        weaviate.configure.vectorizer.text2VecOpenAI({
          name: "title_vector",
          sourceProperties: ["title"],
          model: embeddingModel,
        }),
        weaviate.configure.vectorizer.text2VecOpenAI({
          name: "content_vector",
          sourceProperties: ["content"],
          model: embeddingModel,
          // Further options
          // dimensions: 256,
          // baseURL: '<custom_weaviate_embeddings_url>',
        }),
      ],
      // Additional parameters not shown
    });
    console.log("Collection created successfully");
  }
  console.log("Schema initialized successfully");
}

// Upload documents to Weaviate
export async function uploadDocuments(
  documents: Array<{ title: string; content: string }>
): Promise<BatchObjectsReturn<undefined>> {
  const myCollection = client.collections.use(collectionName);

  let dataObjects = [];

  for (let srcObject of documents) {
    dataObjects.push({
      title: srcObject.title,
      content: srcObject.content,
    });
  }

  const response = await myCollection.data.insertMany(dataObjects);

  return response;
}

// Search for relevant documents
export async function searchDocuments(
  query: string,
  limit: number = 3
): Promise<WeaviateNonGenericObject[]> {
  const myCollection = client.collections.use(collectionName);

  let result;

  result = await myCollection.query.nearText(
    query,
    {
      limit: limit,
      targetVector: "content_vector", // Specify that we want to search using the content vector
    }
  );

  return result.objects;
}
