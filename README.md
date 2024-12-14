# Docx To PDF Lambda

This is a simple lambda function that converts a docx file to a pdf file using libreoffice.

## Technologies

- Node.js (20)
- Libreoffice (24.8.3.2)
- Github Actions
- AWS Lambda
- AWS ECR
- Docker

## How to use

1. Clone this repository
2. Create a new ECR repository in your AWS account
3. Create a new lambda function in your AWS account
2. Configure your AWS credentials and other secrets in github secrets
3. Push the code to your repository

## Environment Variables

- `AWS_ACCOUNT_ID` - Your AWS account ID
- `AWS_KEY_ID` - Your AWS key ID
- `AWS_SECRET` - Your AWS secret key
- `AWS_ECR_IMAGE_TAG` - The tag of the image in ECR
- `AWS_ECR_REPOSITORY` - The name of the ECR repository
- `AWS_LAMBDA_NAME` - The name of the lambda function
- `AWS_LAMBDA_REGION` - The region where the lambda function will be deployed

## Consuming the lambda

```javascript

const fs = require('fs');
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({
  region: YOUR_REGION_HERE, credentials: new AWS.Credentials({
    accessKeyId: YOUR_ACCESS_KEY_ID,
    secretAccessKey: YOUR_SECRET_ACCESS_KEY
  })
});

const fileContent = fs.readFileSync(YOUR_FILE_TO_BE_CONVERTED)
const payload = {
  fileContent,
  fileName: YOUR_FILE_TO_BE_CONVERTED_NAME.docx
};

const invokeLambda = async () => {
  try {
    const response = await lambda.invoke({ Payload: JSON.stringify(payload), FunctionName: YOUR_LAMBDA_FUNCTION_NAME }).promise();
    const responsePayload = JSON.parse(response.Payload);
    fs.writeFileSync(YOUR_OUTPUT_FILE_NAME.pdf, Buffer.from(responsePayload.body));

    console.log("Lambda Response:", responsePayload);
  } catch (error) {
    console.error(error);
  }
};

invokeLambda();
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.txt) file for details.
