const fs = require("fs");
const AWS = require("aws-sdk");
const creds = "./creds.json";

/**
 * If we have locally available credentials, use them
 *
 * If we don't find them, we are presumably operating somewhere that
 * credentials are obtained in some other way (e.g. in IAM if we are running as
 * a lambda
 */
if (fs.existsSync(creds)) {
    AWS.config.loadFromPath(creds);
}

/**
 * Create our various AWS clients
 */
const dbClient = new AWS.DynamoDB.DocumentClient();

/**
 * Get a value from DynamoDB, from a passed in table and query object
 */
const dbGet = (table, query) => {
    const params = {
        TableName: table,
        Key: query
    };

    const request = dbClient.get(params);
    return request.promise();
};

/**
 * Expose various DynamoDB operations
 */
const db = {
    get: dbGet
};

module.exports = {
    db
};
