import "dotenv/config";
import { createClient } from "@deepgram/sdk";
import fs from "fs";

// path to text file
//const text = fs.readFileSync("text.txt").toString();
const url = "https://gist.githubusercontent.com/jpvajda/34a0f88244ef8ff7592568892189006c/raw/2e9e7ad79a32f7130e19f7172d856fbe0b6b5891/sample-text.txt";

const analyzeText = async () => {
  // STEP 1: Create a Deepgram client using the API key
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

  // STEP 1.5: Fetch text from URL
  console.log("Fetching text from URL...");
  const urlResponse = await fetch(url);
  const text = await urlResponse.text();
  console.log("Fetched text length:", text.length);

  // STEP 2: Call the analyzeText method with the text payload and options
  const { result, error } = await deepgram.read.analyzeText(
    {
      text,
    },
    // STEP 3: Configure Deepgram options for text analysis
    {
      language: "en",
      sentiment: true,
      intents: true,
      summarize: true,
      topics: true,
    }
  );

  if (error) {
    console.error("Error:", error);
    throw error;
  }

  // STEP 4: Print the results
  console.log("\n=== FULL RESULT ===");
  console.dir(result, { depth: null });

  console.log("\n=== RESULTS KEYS ===");
  console.log("Keys in result.results:", Object.keys(result.results || {}));

  console.log("\n=== SUMMARY STRUCTURE ===");
  console.log("result.results.summary:", JSON.stringify(result.results?.summary, null, 2));

  console.log("\n=== TOPICS STRUCTURE ===");
  console.log("result.results.topics:", JSON.stringify(result.results?.topics, null, 2));

  console.log("\n=== INTENTS STRUCTURE ===");
  console.log("result.results.intents:", JSON.stringify(result.results?.intents, null, 2));

  console.log("\n=== SENTIMENTS STRUCTURE ===");
  console.log("result.results.sentiments:", JSON.stringify(result.results?.sentiments, null, 2));
};

analyzeText();
