const twilio = require("twilio");
const dotenv = require("dotenv");
dotenv.config();

const accountSID = "ACe51d38b8f8f37b623fad3470cb7fda17";
const authToken = "0b2077812c9ea3a52a299782ac944cb2";

const client = twilio(accountSID, authToken);

module.exports = client;
