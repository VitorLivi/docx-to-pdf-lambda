import { writeFileSync, readFileSync, readdirSync } from "fs";
import { v4 as uuid } from "uuid";
import { convertTo } from "@shelf/aws-lambda-libreoffice";

async function convertDocxToPdf(buffer) {
  const tempFileName = uuid();
  const tempDir = "/tmp";

  writeFileSync(`${tempDir}/${tempFileName}.docx`, buffer);

  console.log("Files in /tmp:");
  console.log(readdirSync("/tmp"));

  await convertTo(`${tempFileName}.docx`, 'pdf');

  console.log("Files in /tmp after conversion:");
  console.log(readdirSync("/tmp"));

  const pdfBuffer = readFileSync(`${tempDir}/${tempFileName}.pdf`);

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
