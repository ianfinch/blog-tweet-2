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
 * Publish the tweet information
 */
const publishToTweetStream = data => {

    return aws.sns.publish("To be tweeted", data, utils.config("topics.tweet-this"))
            .then(published => ({ data, published }));
};

/**
 * The handler which gets triggered by the lambda
 */
exports.handler = (event, context, callback) => {

    aws.db.get(utils.config("tables.config"), { blog: utils.config("blogName") })
        .then(articles => articles.Item.articles)
        .then(utils.fetch)
        .then(csvToObject)
        .then(chooseRandomItem)
        .then(publishToTweetStream)
        .then(data => utils.returnSuccess(data, callback))
        .catch(err => utils.returnError(err, callback));
};
