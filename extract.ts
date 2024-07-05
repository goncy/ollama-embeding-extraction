import { Glob } from "bun";
import ollama from "ollama"
import { EMBEDING_MODEL } from "./constants";

const matcher = new Glob("*.txt");
const result: TextEmbed[] = []

for await (const file of matcher.scan("./inputs")) {
  let content = await Bun.file(`./inputs/${file}`).text();

  const chunks = content
    .split(/\r\n\r\n/gm)
    .reduce<string[]>((chunks, line) => {
      const chunk = line.trim().replace(/(\r|\n|\s{2,})/gm, '')

      if (chunk.length) chunks.push(chunk)

      return chunks
    }, [])

  for await (const [, chunk] of chunks.entries()) {
    const embed = (await ollama.embeddings({ model: EMBEDING_MODEL, prompt: chunk })).embedding

    result.push({ chunk, embed });
    
    process.stdout.write(".");
  }
}

await Bun.write(`./output.json`, JSON.stringify(result, null, 2));