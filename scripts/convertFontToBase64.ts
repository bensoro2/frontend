const fs = require("fs");

const fontFiles = [
  "THSarabunNew.ttf",
  "THSarabunNew-Bold.ttf",
  "THSarabunNew-Italic.ttf",
  "THSarabunNew-BoldItalic.ttf",
] as const;

// กำหนด type ให้กับ fontType
type FontType = "" | "-Bold" | "-Italic" | "-BoldItalic";
type FontStyle = "normal" | "bold" | "italics" | "bolditalics";

// กำหนด type ให้กับ fontMapping
const fontMapping: Record<FontType, FontStyle> = {
  "": "normal",
  "-Bold": "bold",
  "-Italic": "italics",
  "-BoldItalic": "bolditalics",
};

const fontsDir = "./public/fonts/";
const outputFile = "./src/fonts/thSarabunFont.ts";

let output = "export const thSarabunFont = {\n";

fontFiles.forEach((file, index) => {
  const fontType = file
    .replace("THSarabunNew", "")
    .replace(".ttf", "") as FontType;
  const key = fontMapping[fontType];

  const font = fs.readFileSync(fontsDir + file);
  const base64 = font.toString("base64");

  output += `  ${key}: '${base64}'${index < fontFiles.length - 1 ? "," : ""}\n`;
});

output += "};\n";

fs.writeFileSync(outputFile, output);
