const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error("⚠️  Missing target folder!");
  console.log("Usage: node generate_index.js <path_to_folder>");
  process.exit(1);
}

const DIRECTORY = path.resolve(args[0]);

if (!fs.existsSync(DIRECTORY) || !fs.statSync(DIRECTORY).isDirectory()) {
  console.error(`❌ Error: Directory does not exist at ${DIRECTORY}`);
  process.exit(1);
}

const OUTPUT_FILE = path.join(DIRECTORY, "index.ts");

function getFilesRecursively(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fileList = getFilesRecursively(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = getFilesRecursively(DIRECTORY);
const assetFiles = allFiles.filter((file) =>
  /\.(png|jpe?g|svg|gif|webp|bmp|json|mp3|wav|m4a|mp4)$/i.test(file),
);

const uniqueAssets = new Map();
let collisionCount = 0;

assetFiles.forEach((filePath) => {
  if (filePath.endsWith("index.ts")) return;

  let relativePath =
    "./" + path.relative(DIRECTORY, filePath).replace(/\\/g, "/");
  let requirePath = relativePath.replace(/@[23]x(\.[a-z0-9]+)$/i, "$1");

  // Isolate just the file name
  let baseFileName = path.basename(filePath);

  // FIX: Strip extensions supporting alphanumeric names (like .mp4) and density markers (@2x, @3x)
  let cleanName = baseFileName
    .replace(/@[23]x/i, "")
    .replace(/\.[a-zA-Z0-9]+$/i, "");

  // Replace anything remaining that isn't a letter or number with an underscore
  let varName = cleanName.replace(/[^a-zA-Z0-9]/g, "_");

  // JAVASCRIPT SAFETY RULE: If it starts with a number, prepend an underscore
  if (/^[0-9]/.test(varName)) {
    varName = "_" + varName;
  }

  // Check for collisions to warn you
  if (uniqueAssets.has(varName) && uniqueAssets.get(varName) !== requirePath) {
    console.warn(
      `⚠️  Collision detected: '${varName}' is being overwritten! Ensure your file names are unique.`,
    );
    collisionCount++;
  }

  uniqueAssets.set(varName, requirePath);
});

const folderName = path.basename(DIRECTORY);
const exportName = folderName.charAt(0).toUpperCase() + folderName.slice(1);

let tsContent = `// Automatically generated file. Do not edit manually.\n\n`;
tsContent += `export const ${exportName} = {\n`;

uniqueAssets.forEach((reqPath, varName) => {
  tsContent += `  ${varName}: require('${reqPath}'),\n`;
});

tsContent += `};\n`;

fs.writeFileSync(OUTPUT_FILE, tsContent);

console.log(
  `✅ Success! Generated index.ts inside ${folderName}/ with ${uniqueAssets.size} mapped assets.`,
);
if (collisionCount > 0) {
  console.log(
    `🚨 Warning: ${collisionCount} naming collisions occurred. Some assets were overwritten.`,
  );
}
