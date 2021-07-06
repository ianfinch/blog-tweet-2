const https = require("https");

const returnSuccess = (msg, callback) => {
    console.info(msg);
    callback(null, msg);
};

const returnError = (msg, callback) => {
    console.error(msg);
    callback(msg);
};

const fetch = (url) => {
    return new Promise(resolve => {
        let result = "";

        https.get(url, response => {

            response.on("data", data => {
                result += data;
            });

            response.on("end", data => {
                resolve(result);
            });
        });
    });
};

module.exports = {
    fetch,
    returnError,
    returnSuccess
};
