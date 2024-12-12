import { writeFileSync, readFileSync, readdirSync } from "fs";
import { v4 as uuid } from "uuid";
import { execSync } from "child_process";

async function convertDocxToPdf(buffer) {
  const tempFileName = uuid();
  const tempDir = "/tmp";

  const inputFilePath = `${tempDir}/${tempFileName}.docx`;
  const outputFilePath = `${tempDir}/${tempFileName}.pdf`;

  writeFileSync(inputFilePath, buffer);

  console.log(readdirSync(tempDir))

  try {
    const res = execSync(`libreoffice --headless --invisible --nodefault --view --nolockcheck --nologo --norestore --convert-to pdf --outdir ${tempDir} ${inputFilePath}`);
    console.log("NO ERROR")
    console.log(res.toString())

  }
  catch (err) {
    console.log("output", err)
    console.log("sdterr", err.stderr.toString())
  }

  console.log(readdirSync(tempDir))

  const pdfBuffer = readFileSync(outputFilePath);

  return pdfBuffer;
}

export const handler = async (event, context) => {
  const { fileContent, fileName } = event;

  try {
    const decodedDocxContent = Buffer.from(fileContent, "base64");
    const pdfBuffer = await convertDocxToPdf(decodedDocxContent);
    const encodedPdfFileContent = pdfBuffer.toString("base64");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName.replace('.docx', '.pdf')}"`,
      },
      body: encodedPdfFileContent,
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error("Error processing file:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "File processing failed." }),
    };
  }
};

