const utils = require("./utils.js");
const aws = require("./aws.js");

/**
 * Split a CSV line into fields
 */
const splitCsvRecord = record => {
    return record.replace(/^"/, "")
                 .replace(/"$/, "")
                 .split('","');
};

/**
 * Convert CSV of articles to an object
 */
const csvToObject = csv => {
    return csv.split("\n")
              .filter(x => x.substr(0, 1) === '"')
              .map(splitCsvRecord);
};

/**
 * Choose a random array element
 */
const chooseRandomItem = arr => {
    return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * The handler which gets triggered by the lambda
 */
exports.handler = (event, context, callback) => {

    aws.db.get(utils.config("configTable"), { blog: utils.config("blogName") })
        .then(articles => articles.Item.articles)
        .then(utils.fetch)
        .then(csvToObject)
        .then(chooseRandomItem)
        .then(data => utils.returnSuccess(data, callback))
        .catch(err => console.error("ERROR", err));
};
