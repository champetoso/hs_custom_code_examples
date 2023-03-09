const hubspot = require("@hubspot/api-client");

exports.main = async (event, callback) => {
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.PRIVATE_APP_TOKEN, //Grab it from the secrets vault
  });
  const phone = event.inputFields["phone"];
  const PublicObjectSearchRequest = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "phone",
            operator: "EQ",
            value: phone,
          },
        ],
      },
    ],
  };

  try {
    //SEARCH CONTACTS WITH THE SAME NUMBER
    console.log("Looking for duplicates based on phone number: " + phone);
    const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch(
      PublicObjectSearchRequest
    );
    let idsToMerge = searchResponse.results
      .map((object) => object.id)
      .filter((vid) => Number(vid) !== Number(event.object.objectId));
    console.log("idsToMerge", idsToMerge);

    //ORGANIZE RESULTS
    if (idsToMerge.length == 0) {
      console.log("No matching contact, nothing to merge");
      callback({
        outputFields: {
          dedupe_code: 200,
        },
      });
      return;
    } else if (idsToMerge.length > 1) {
      console.log(
        `Found multiple potential contact IDs ${idsToMerge.join(", ")} to merge`
      );
      throw new Error("Ambiguous merge; more than one matching contact");
    }
    let idToMerge = idsToMerge[0];
    console.log(
      `Merging enrolled contact id=${event.object.objectId} into contact id=${idToMerge}`
    );

    //MERGE CONTACTS
    const PublicMergeInput = {
      primaryObjectId: idToMerge,
      objectIdToMerge: event.object.objectId,
    };
    const mergeResponse =
      await hubspotClient.crm.contacts.publicObjectApi.merge(PublicMergeInput);
    console.log("Merged Successfully");
  } catch (e) {
    e.message === "HTTP request failed"
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e);
    throw e;
  }
};
