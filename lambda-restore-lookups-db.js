const utils = require("./utils.js");
const aws = require("./aws.js");
const fs = require("fs/promises");

/**
 * Load in the database backup
 */
const getDbFile = filename => {

    return fs.readFile(filename)
            .then(JSON.parse);
};

/**
 * Store each element in the tweets array into DynamoDB
 */
const storeTweets = tweets => {

    return Promise.all(
        tweets.map(tweet => {
            return aws.db.put(utils.config("tables.twitterPosts"), tweet);
        })
    );
};

/**
 * The handler which gets triggered by the lambda
 */
exports.handler = (event, context, callback) => {

    getDbFile("blog-tweet-lookups.json")
        .then(storeTweets)
        .then(data => utils.returnSuccess(data, callback))
        .catch(err => utils.returnError(err, callback));
};
