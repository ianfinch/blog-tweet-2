const utils = require("./utils.js");
const aws = require("./aws.js");
const Twit = require("twit");

/**
 * Get our twitter credentials from DynamoDB
 */
const getTwitterCredentials = () => {

    return aws.db.get(utils.config("tables.twitterCreds"), { user: utils.config("twitterUser") });
};

/**
 * Check whether we've already tweeted this before
 */
const findPreviousTweet = ([tweet, url]) => {
    return aws.db.get(utils.config("tables.twitterPosts"), { url: url, message: tweet })
            .then(result => {

                if (result.Item) {
                    return {
                        tweet: result.Item
                    };
                }

                return {
                    url,
                    message: tweet
                };
            });
};

/**
 * Check that the last 5 tweets have all been natural ones
 */
const checkForNaturalTweets = tweets => {

    const naturalPosts = tweets.data
                            .map(x => x.source)
                            .filter(x => x.includes("Twitter for iPhone"));

    return tweets.data.length === naturalPosts.length;
};

/**
 * Either retweet an existing tweet, or send a new one
 */
const retweetOrNewTweet = (okayToTweet, tweetInfo, twitter) => {

    // Check whether we should just give up
    if (!okayToTweet) {
        return sendSkippedToSns()
                .then(() => ({ tweetInfo, tweetResult: null }));
    }

    // Retweet an existing tweet ...
    let result = null;
    if (tweetInfo.tweet) {
        result = twitter.post("statuses/retweet/:id", { id: tweetInfo.tweet.tweetId });

    // ... or if it doesn't exist, send a new tweet
    } else {
        result = twitter.post("statuses/update", { status: tweetInfo.message + " " + tweetInfo.url });
    }

    // Send an SNS notification about what we've done
    return result
            .then(tweetResult => ({ tweetInfo, tweetResult }))
            .then(tweetResult => { sendToSns(tweetResult); return tweetResult });
};

/**
 * Send a "didn't post" message to SNS
 */
const sendSkippedToSns = () => {

    return aws.sns.publish(
        "Skipped automated blog tweet",
        "Skipped automated blog tweet because there have not been enough natural tweets since the last automated tweet",
        utils.config("topics.send-email")
    );
}

/**
 * Send a posted confirmation message to SNS
 */
const sendToSns = data => {

    const url = data.tweetInfo.url
                    ? data.tweetInfo.url
                    : data.tweetInfo.tweet.url;

    return aws.sns.publish(
        "Tweeted about blog: " + url,
        JSON.stringify(data, null, 4),
        utils.config("topics.send-email")
    );
};

/**
 * Send a tweet
 */
const sendTweet = ([tweetCreds, tweetInfo]) => {

    const twitter = new Twit({
        consumer_key: tweetCreds.Item["consumer-key"],
        consumer_secret: tweetCreds.Item["consumer-secret"],
        access_token: tweetCreds.Item["access-token"],
        access_token_secret: tweetCreds.Item["access-secret"]
    });

    // Check for recent tweets, to avoid spamming my timeline
    return twitter.get("statuses/user_timeline", { count: 5 })
            .then(checkForNaturalTweets)
            .then(okayToTweet => retweetOrNewTweet(okayToTweet, tweetInfo, twitter));
};

/**
 * Update the tweets lookup table with details of what we've just tweeted
 */
const updateTweetsTable = ({tweetInfo, tweetResult}) => {

    if (!tweetResult) {
        return null;
    }

    if (tweetResult.data.retweeted_status) {
        return aws.db.put(utils.config("tables.twitterPosts"), {
            url: tweetInfo.tweet.url,
            message: tweetInfo.tweet.message,
            tweetId: tweetInfo.tweet.tweetId,
            dates: tweetInfo.tweet.dates.concat(tweetResult.data.created_at),
            user: tweetInfo.tweet.user,
            userId: tweetInfo.tweet.userId
        });
    }

    return aws.db.put(utils.config("tables.twitterPosts"), {
        url: tweetInfo.url,
        message: tweetInfo.message,
        tweetId: tweetResult.data.id_str,
        dates: [ tweetResult.data.created_at ],
        user: tweetResult.data.user.screen_name,
        userId: tweetResult.data.user.id_str
    });
};

/**
 * Format the result of the promise chain
 */
const formatResult = result => {

    if (result === null) {
        return "No tweet posted";
    }

    return "Blog post tweeted/retweeted: " + result.Item.url;
};

/**
 * The handler which gets triggered by the lambda
 */
exports.handler = (event, context, callback) => {
    const tweetDetails = JSON.parse(event.Records[0].Sns.Message);

    Promise.all([getTwitterCredentials(),
                 findPreviousTweet(tweetDetails)])
        .then(sendTweet)
        .then(updateTweetsTable)
        .then(formatResult)
        .then(data => utils.returnSuccess(data, callback))
        .catch(err => utils.returnError(err, callback));
};
