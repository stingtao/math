import { readdir, stat } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const sourceDirectory = fileURLToPath(new URL("../assets/visuals-source/", import.meta.url));
const outputDirectory = fileURLToPath(new URL("../public/visuals/", import.meta.url));
const sourceNames = (await readdir(sourceDirectory)).filter((name) => extname(name) === ".jpg" || name === "math-trail-hero.png" || name === "signed-numbers-context.png").sort();
const sourceSpecs = sourceNames.map((sourceName) => sourceName === "math-trail-hero.png"
  ? { sourceName, width: 1280, height: 853 }
  : sourceName === "signed-numbers-context.png"
  ? { sourceName, width: 1200, height: 900 }
  : { sourceName, width: 1200, height: 800 });
const maximumBytes = 100_000;
let sourceBytes = 0;
let outputBytes = 0;

for (const { sourceName, width, height } of sourceSpecs) {
  const sourcePath = join(sourceDirectory, sourceName);
  const outputName = `${basename(sourceName, extname(sourceName))}.webp`;
  const outputPath = join(outputDirectory, outputName);
  const sourceInfo = await stat(sourcePath);
  sourceBytes += sourceInfo.size;

  await sharp(sourcePath)
    .resize(width, height, { fit: "cover" })
    .webp({ quality: 78, effort: 6, smartSubsample: true })
    .toFile(outputPath);

  const [metadata, outputInfo] = await Promise.all([sharp(outputPath).metadata(), stat(outputPath)]);
  if (metadata.width !== width || metadata.height !== height) throw new Error(`${outputName} has unexpected dimensions.`);
  if (outputInfo.size > maximumBytes) throw new Error(`${outputName} is ${outputInfo.size} bytes; expected at most ${maximumBytes}.`);
  outputBytes += outputInfo.size;
}

const savedPercent = Math.round((1 - outputBytes / sourceBytes) * 100);
console.log(`Optimized ${sourceSpecs.length} context visuals: ${sourceBytes} → ${outputBytes} bytes (${savedPercent}% smaller).`);
