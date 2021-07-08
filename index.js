const lambda = {
    getArticle: require("./lambda-get-article.js"),
    tweetArticle: require("./lambda-tweet-article.js")
};


const fakeSnsPublish = (err, payload) => {

    const fakeSnsEvent = {
        Records: [{
            Sns: {
                Message: JSON.stringify(payload.data)
            }
        }]
    };

    lambda.tweetArticle.handler(fakeSnsEvent, null, () => null);
};

lambda.getArticle.handler(null, null, fakeSnsPublish);
