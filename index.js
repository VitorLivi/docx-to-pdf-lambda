import { exec } from "child_process";
import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { v4 as uuid } from "uuid";

async function convertDocxToPdf(buffer) {
  const tempFileName = uuid();
  const tempDir = "/tmp";
  const userProfilePath = `/tmp/libreoffice-user-${uuid()}`;

  writeFileSync(fontCacheDir, '');

  const envVariables = {
    ...process.env,
    FONTCONFIG_FILE: '/dev/null',
    FONTCONFIG_PATH: '/tmp',
  };

  const inputFilePath = `${tempDir}/${tempFileName}.docx`;
  const outputFilePath = `${tempDir}/${tempFileName}.pdf`;

  writeFileSync(inputFilePath, buffer);

  await new Promise((resolve, reject) => {
    const command = `libreoffice --headless --norestore --nofirststartwizard --invisible -env:UserInstallation=file://${userProfilePath} --convert-to pdf --outdir ${tempDir} ${inputFilePath}`;
    exec(command, { env: envVariables }, (error, stdout, stderr) => {
      if (error) {
        console.error("LibreOffice Error:", error.message);
        reject(new Error(error.message));
        return;
      }
      if (stderr) {
        console.warn("LibreOffice Warning:", stderr);
      }
      console.log(stdout);
      resolve(true);
    });
  }).catch((error) => {
    throw new Error(`Error during conversion: ${error.message}`);
  });

  const pdfBuffer = readFileSync(outputFilePath);

  unlinkSync(inputFilePath);
  unlinkSync(outputFilePath);

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
