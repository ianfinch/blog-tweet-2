const lambda = require("./lambda-get-article.js");

const callbackHandler = (err, success) => {

    if (err) {
        console.error(err);
    } else {
        console.info(success);
    }

}

lambda.handler(null, null, callbackHandler);
