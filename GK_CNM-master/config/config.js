const aws = require("aws-sdk");

const dynamoDB = new aws.DynamoDB.DocumentClient({
  region: "us-east-2",
  accessKeyId: "",
  secretAccessKey: "",
});

module.exports = dynamoDB;