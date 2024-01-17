const axios = require("axios");

exports.main = async (event, callback) => {
  const THREAD_ID = event.inputFields["hs_thread_id"];
  var channelAccountId, channelId, senderActorId, recipients;
  const host = "https://api.hubapi.com";
  const historyPath = `/conversations/v3/conversations/threads/${THREAD_ID}/messages`;
  const config = {
    headers: {
      accept: "application/json",
      authorization: "Bearer " + process.env.HS_TOKEN,
      "content-type": "application/json",
    },
  };

  try {
    // This API call will get some meta-data from the thread that will be needed later for writing the outgoing message:
    axios.get(host + historyPath, config).then((result) => {
      const list = result.data.results;
      const messages = list.filter(function (message) {
        return message.type === "MESSAGE" && message.direction === "INCOMING";
      });

      channelAccountId = messages[0].channelAccountId;
      channelId = messages[0].channelId;
      senderActorId = "A-9999999"; // You'd need to grab this Actor ID value with a separate API call.
      recipients = [
        {
          actorId: messages[0].senders[0].actorId,
          name: messages[0].senders[0].name,
          deliveryIdentifiers: [messages[0].senders[0].deliveryIdentifier],
        },
      ];

      // Prepare and write the message:
      const payload = {
        type: "MESSAGE",
        text: "Hola! Bienvenido al canal virtual. Cuéntanos cómo podemos ayudar?. 1 Ventas. 2 Soporte. 3 Informacion General",
        richText:
          "<p>&#129302; Hola! Bienvenido al canal virtual. Cuéntanos cómo podemos ayudar?</p><p></p><p>&#xe21c; Ventas</p><p>&#xe21d;  Soporte</p>&#xe21e; Información General</p>",
        channelAccountId,
        channelId,
        senderActorId,
        recipients,
      };

      console.log(JSON.stringify(payload, null, 2));

      axios.post(host + historyPath, payload, config).then((result) => {
        console.log(result);
        callback({
          outputFields: {
            payload,
          },
        });
      });
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};
