import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

//environments variable

dotenv.config();
const API_KEY = process.env.API_KEY;

//security middleware
const app = express();
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credential: true,
  })
);

//late limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "To many requests from this Ip",
});

app.use(limiter);

app.use(express.json({ limit: "10mb" }));

app.post("/api/explain-code", async (req, res) => {
  try {
    const { code, language } = req.body;
    console.log("payload", code, language);
    if (!code || !language) {
      return res.status(400).json({ error: "Code is required" });
    }

    // open ai code
    let messages;

    if (language.toLowerCase() === "english") {
      messages = [
        {
          role: "system",
          content:
            "You are AskDurga AI — a friendly English assistant. When the user gives a sentence, fix the grammar and return two things only:\n1. The corrected sentence in clean, proper English.\n2. A short one-line reason for the mistake in very simple English (like 'you used wrong word order' or 'you missed the verb'). Do not mention capitalization, commas, or punctuation unless it changes meaning.",
        },
        {
          role: "user",
          content: `Correct this sentence and explain shortly:\n\n"${code}"`,
        },
      ];
    } else {
      messages = [
        {
          role: "system",
          content: `You are AskDurga AI — a code explainer assistant.

When the user provides any code in any programming language (like JavaScript, Python, Java, etc.), follow these rules:

1. Rewrite the same code clearly and neatly.
2. Add step-by-step comments before each major action in this exact format:
   // step-1: ...
   // step-2: ...
   (Use numbering properly in order.)
3. If the code includes any built-in function or method (like console.log(), print(), len(), etc.), add a short inline comment explaining what it does.
4. Do not explain outside the code — only show commented code.
5. Keep the tone clean and simple, just like this example:

Example Output:
\`\`\`javascript
// step-1: Define the function named 'greet' with 0 parameters
function greet() {   
  // step-2: Inside the function, print a message to the console
  console.log('Hello AskDurga-AI'); // it will print "Hello AskDurga-AI"
}

// step-3: Call the 'greet' function (no arguments passed)
greet();
\`\`\`
`,
        },
        {
          role: "user",
          content: `Explain this ${language} code by rewriting it with step-by-step comments as shown in the example.

1. Only return the code — do not add any extra explanation.
2. Follow the numbering pattern (step-1, step-2, etc.).
3. Explain any built-in functions or methods inline.
4. Keep code structure clean and easy to read.

Code:
${code}`,
        },
      ];
    }

    const client = new OpenAI({
      baseURL: "https://api.studio.nebius.com/v1/",
      apiKey: API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      temperature: 0.3,
      max_tokens: 800,
    });

    console.log("response", response);
    const explanation = response?.choices[0]?.message.content;
    if (!explanation) {
      return res.status(500).json({ error: "Failed to Explain code" });
    }
    res.json({
      explanation,
      language: language || "unkonwn",
    });
  } catch (err) {
    console.error("askDurga AI api error");
    res.status(500).json({ error: "Server Error", details: err.message });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`API server listening on ${PORT}`);
});
