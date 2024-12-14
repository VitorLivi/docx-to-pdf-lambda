import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { v4 as uuid } from "uuid";

async function cleanTempFiles(tempDir, tempFileName) {
  execSync(`rm -rf ${tempDir}/${tempFileName}.*`);
}

async function convertDocxToPdf(buffer) {
  const tempFileName = uuid();
  const tempDir = "/tmp";

  const inputFilePath = `${tempDir}/${tempFileName}.docx`;
  const outputFilePath = `${tempDir}/${tempFileName}.pdf`;

  writeFileSync(inputFilePath, buffer);

  try {
    const res = execSync(`cd /tmp && libreoffice --headless --invisible --nodefault --view --nolockcheck --nologo --norestore --convert-to pdf:writer_pdf_Export --outdir ${tempDir} ${inputFilePath}`);
    console.log(res.toString())
  } catch (err) {
    // Exec libreoffice twice because in the first time that it executes, it creates the profile and restarts the service, so, we need to do it manually.
    if (err.status === 81) {
      try {
        const res = execSync(`cd /tmp && libreoffice --headless --invisible --nodefault --view --nolockcheck --nologo --norestore --convert-to pdf:writer_pdf_Export --outdir ${tempDir} ${inputFilePath}`);
        console.log(res.toString())

      } catch (err) {
        console.log("output", err)
        console.log(JSON.stringify(err))
      }
    } else {
      console.log("output", err)
      console.log(JSON.stringify(err))
    }
  }

  const pdfBuffer = readFileSync(outputFilePath);

  cleanTempFiles(tempDir, tempFileName);

  return pdfBuffer;
}

function validate(fileContent, fileName) {
  if (!fileContent) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing file content" }),
    };
  } else if (!fileName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing file name" }),
    };
  } else if (!fileName.endsWith(".docx")) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid file format. Only .docx files are supported" }),
    }
  }

  return null
}

export const handler = async (event, context) => {
  const { fileContent, fileName } = event;

  console.log("Received file:", fileName);
  console.log("Type of file content:", typeof fileContent);

  const validationError = validate(fileContent, fileName);

  if (validationError) {
    return validationError;
  }

  try {
    const pdfBuffer = await convertDocxToPdf(Buffer.from(fileContent));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName.replace('.docx', '.pdf')}"`,
      },
      body: pdfBuffer
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
