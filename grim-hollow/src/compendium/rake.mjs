// scripts/assemble.js
import { promises as fs } from "node:fs";
import path from "node:path";

const INPUT_DIR = process.argv[2] || "data";
const OUTPUT_FILE = process.argv[3] || path.join("dist", "catalog.json");

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function readIfExists(p) {
  try {
    return await fs.readFile(p, "utf8");
  } catch {
    return null;
  }
}

async function main() {
  const root = path.resolve(INPUT_DIR);
  const out = { pagesByCategory: {} };

  const firstLevel = await fs.readdir(root, { withFileTypes: true });
  const folders = firstLevel.filter(e => e.isDirectory()).map(e => e.name);

  for (const folder of folders) {
    const folderPath = path.join(root, folder);
    const items = await fs.readdir(folderPath);
    const jsonFiles = items.filter(f => f.toLowerCase().endsWith(".json"));

    const bucket = {};
    for (const jsonFile of jsonFiles) {
      const base = path.basename(jsonFile, path.extname(jsonFile));
      const jsonPath = path.join(folderPath, jsonFile);
      const htmlPath = path.join(folderPath, base + ".html");

      let data;
      try {
        data = JSON.parse(await fs.readFile(jsonPath, "utf8"));
      } catch (err) {
        console.error(`Skipping invalid JSON: ${jsonPath}\n  ${err.message}`);
        continue;
      }

      const html = await readIfExists(htmlPath);

      // Always include both "content" and "description"
      const entry = {
        'data-payload': data,
        content: html ?? ""
      };

      bucket[base] = entry;
    }

    if (Object.keys(bucket).length > 0) {
      out.pagesByCategory[folder] = bucket;
    }
  }

  await ensureDir(OUTPUT_FILE);
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
