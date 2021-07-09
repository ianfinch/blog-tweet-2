const lambda = {
    getArticle: require("./lambda-get-article.js"),
    tweetArticle: require("./lambda-tweet-article.js"),
    restoreLookups: require("./lambda-restore-lookups-db.js")
};

/**
 * Run (i.e. locally fake) a lambda and return a promise
 *
 * Want to be able to chain in .then() series, passing data through, so this
 * needs to return a function which actually invokes the lambda.
 */
const invokeLambda = faas => {

    // This is the actual lambda execution function
    return (event) => {

        // Create a promise, then resolve it from the lambda
        return new Promise(resolve => {

            // Call the lambda and resolve to its result
            lambda[faas].handler(event, null, (err, result) => resolve(result));
        });
    };
};


/**
 * Fake an SNS message, to glue together lambda calls
 */
const fakeSnsPublish = (payload) => {

    return {
        Records: [{
            Sns: {
                Message: JSON.stringify(payload.data)
            }
        }]
    };
};

// invokeLambda("restoreLookups")();

invokeLambda("getArticle")()
   .then(fakeSnsPublish)
   .then(invokeLambda("tweetArticle"))
   .then(console.log);
