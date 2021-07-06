const utils = require("./utils.js");

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
    const articles = process.argv[2];

    if (!articles) {
        utils.returnError("No URL specified", callback);
        return;
    }

    utils.fetch(articles)
        .then(csvToObject)
        .then(chooseRandomItem)
        .then(data => utils.returnSuccess(data, callback));
};
