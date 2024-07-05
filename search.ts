import ollama from "ollama";
import similarity from "compute-cosine-similarity";

import { EMBEDING_MODEL, PROMPT_MODEL, SYSTEM_PROMPT } from "./constants";

const embeds: TextEmbed[] = await Bun.file("./output.json").json();
const prompt = Bun.argv.slice(2).join(" ");
const promptEmbed = (await ollama.embeddings({ model: EMBEDING_MODEL, prompt })).embedding;

const similarities = embeds.map(({ chunk, embed }) => ({
  chunk,
  similarity: similarity(promptEmbed, embed)!
})).sort((a, b) => b.similarity - a.similarity).slice(0, 50);

const {response: output} = await ollama.generate({
  model: PROMPT_MODEL,
  stream: false,
  system: `${SYSTEM_PROMPT}
  
  Answer all questions using the following relevant documents as context:
  
  ---
  ${similarities.map(({ chunk }) => chunk).join("\n\n")}
  ---`,
  prompt
})

process.stdout.write(output);