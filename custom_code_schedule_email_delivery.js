const axios = require("axios");

exports.main = async () => {
  axios({
    method: "post",
    url:
      "https://api.hubapi.com/broadcast/v1/broadcasts?hapikey=" +
      process.env.hapikey, //     DEPRECATED      //
    data: {
      channelGuid: process.env.channelguid,
      triggerAt: 1638363600000, //December 1st 2021, 08:00:00
      content: {
        body: "A simple message. Hi team! This is Diego Pinzon",
      },
    },
  }).then(
    (response) => {
      console.log(response.data);
    },
    (error) => {
      throw error;
    }
  );
};
