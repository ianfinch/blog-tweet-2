const utils = require("./utils.js");
const aws = require("./aws.js");

aws.db.scan(utils.config("tables.twitterPosts"))
    .then(data => data.Items)
    .then(data => JSON.stringify(data, null, 4))
    .then(console.log);
