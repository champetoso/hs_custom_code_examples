const axios = require("axios");

exports.main = async (event, callback) => {
  const THREAD_ID = event.inputFields["hs_thread_id"]; //This parameter should be added to the "Inputs" section at the UI
  const host = "https://api.hubapi.com";
  const historyPath = `/conversations/v3/conversations/threads/${THREAD_ID}/messages`;
  const config = {
    headers: {
      accept: "application/json",
      authorization: "Bearer " + process.env.HS_TOKEN, //This parameter should be added to the "Secrets" section at the UI
      "content-type": "application/json",
    },
  };

  try {
    axios.get(host + historyPath, config).then((result) => {
      const list = result.data.results;
      const messages = list.filter(function (message) {
        return message.type === "MESSAGE" && message.direction === "INCOMING";
      });
      callback({
        outputFields: {
          respuesta: messages[0].text,
        },
      });
      console.log(JSON.stringify(messages[0], null, 2));
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};
