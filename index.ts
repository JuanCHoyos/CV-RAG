import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { BedrockEmbeddings, ChatBedrockConverse } from "@langchain/aws";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { tool } from "@langchain/core/tools";
import { createAgent, HumanMessage, SystemMessage } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { Chalk } from "chalk";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as z from "zod";


const rl = readline.createInterface({ input, output });
const chalk = new Chalk();
const cvPdfPath = "./sources/cv.pdf";
const retrieveSchema = z.object({ query: z.string() });

const loader = new PDFLoader(cvPdfPath, {
  parsedItemSeparator: ""
})

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const embeddings = new BedrockEmbeddings({
  model: process.env.AWS_EMBEDDING_MODEL,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  }
});


const model = new ChatBedrockConverse({
  model: process.env.AWS_LLM_MODEL,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const checkpointer = new MemorySaver();
const vectorStore = new MemoryVectorStore(embeddings);


const retrieve = tool(
  async ({ query }) => {
    const retrievedDocs = await vectorStore.similaritySearch(query, 2);
    const serialized = retrievedDocs
      .map(
        (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`
      )
      .join("\n");
    return [serialized, retrievedDocs];
  },
  {
    name: "retrieve",
    description: "Retrieve information related to a query.",
    schema: retrieveSchema,
    responseFormat: "content_and_artifact",
  }
);


const systemPrompt = new SystemMessage(`ROLE
You are an expert assistant specialized exclusively in the résumé (hoja de vida) of "Juan Carlos Hoyos Cabarique".

MISSION
Your mission is to answer user questions using ONLY the information provided by the retrieval tool, which supplies contextual excerpts extracted from the résumé source.

You must rely entirely on that retrieved context to form your answers.

TOOLS
You have access to a retrieval tool that returns relevant context from the résumé of "Juan Carlos Hoyos Cabarique".
You MUST use this tool whenever answering a question.

BEHAVIOR RULES
- You MUST NOT use prior knowledge, assumptions, or external information.
- You MUST NOT invent, infer, or complete missing information.
- You MUST NOT answer questions that are not directly related to the résumé content.
- If the retrieved context does not contain enough information to answer the question, clearly state that the information is not available in the source.
- You MUST stay strictly within the scope of the provided context.
- You MUST NOT provide opinions or general advice outside the résumé.
- You MUST respond in the SAME language used by the user.

ANSWER GUIDELINES
- Base your answer strictly on the retrieved context.
- Be concise, precise, and factual.
- Do not mention the tool, the retrieval process, or internal reasoning.
- Do not add explanations beyond what the context supports.

FAILURE CONDITION
If the question cannot be answered using the retrieved context from the résumé, respond with a message indicating that the information is not present in the source.
`
)

const agent = createAgent({ model: model, tools: [retrieve], systemPrompt, checkpointer, });


const loadAndEmbedDocuments = async () => {
  const documents = await loader.load();
  const splitDocs = await textSplitter.splitDocuments(documents);
  await vectorStore.addDocuments(splitDocs);
}


const main = async () => {
  await loadAndEmbedDocuments();

  console.log(chalk.yellow("You can now ask questions about the CV document. Type 'exit' to quit."));
  while (true) {
    const question = await rl.question("Question: ");
    if (question === "exit") break;
    const response = await agent.invoke({
      messages: [new HumanMessage({ content: question })]
    }, {
      configurable: { thread_id: "1" }
    });

    console.log(chalk.green("AI:"), chalk.blue(response.messages.at(-1)?.content));
  }
}

main().then();