const axios = require("axios");

exports.main = async (event, callback) => {
  const thread_id = event.inputFields["hs_thread_id"];
  var channelAccountId, channelId, senderActorId, recipients;
  const host = "https://api.hubapi.com";
  const historyPath =
    "/conversations/v3/conversations/threads/" + thread_id + "/messages";
  const config = {
    headers: {
      accept: "application/json",
      authorization: "Bearer " + process.env.hstoken,
      "content-type": "application/json",
    },
  };

  try {
    axios.get(host + historyPath, config).then((result) => {
      const list = result.data.results;
      const messages = list.filter(function (message) {
        return message.type === "MESSAGE" && message.direction === "INCOMING";
      });

      channelAccountId = messages[0].channelAccountId;
      channelId = messages[0].channelId;
      senderActorId = "A-25354413";
      recipients = [
        {
          actorId: messages[0].senders[0].actorId,
          name: messages[0].senders[0].name,
          deliveryIdentifiers: [messages[0].senders[0].deliveryIdentifier],
        },
      ];

      const payload = {
        type: "MESSAGE",
        text: "Can you follow up?",
        richText:
          "<p>&#129302;Hola! Bienvenido al canal virtual. Cuéntanos cómo podemos ayudar?</p><p></p><p><b>1 - </b> Ventas</p><p><b>2 - </b> Soporte</p><b>3 - </b> Información General</p>",
        channelAccountId,
        channelId,
        senderActorId,
        recipients,
      };

      console.log(JSON.stringify(payload, null, 2));

      axios
        .post(host + historyPath, payload, config)
        .then((result) => {
          console.log(result);
          callback({
            outputFields: {
              payload,
            },
          });
        })
        .catch((e) => {
          console.error(e);
          throw e;
        });
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};
