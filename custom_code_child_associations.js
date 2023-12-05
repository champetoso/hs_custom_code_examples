const hubspot = require("@hubspot/api-client");

exports.main = async (event, callback) => {
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.hstoken,
  });

  let parentCompanyId, engagementId, engagementType;
  const companyId = event.inputFields["hs_object_id"];
  const properties = undefined;
  const propertiesWithHistory = undefined;
  const associations = [
    "companies",
    "calls",
    "notes",
    "emails",
    "meetings",
    "tasks",
    "communications",
  ];
  const archived = false;
  const idProperty = undefined;

  try {
    const apiResponse = await hubspotClient.crm.companies.basicApi.getById(
      companyId,
      properties,
      propertiesWithHistory,
      associations,
      archived,
      idProperty
    );
    console.log(JSON.stringify(apiResponse.associations, null, 2));

    if (apiResponse.associations.hasOwnProperty("companies")) {
      const hasParent = apiResponse.associations.companies.results.some(
        (item) => item.type === "child_to_parent_company"
      );
      console.log("hasParent:", hasParent);
      if (hasParent) {
        for (
          let i = 0;
          i < apiResponse.associations.companies.results.length;
          i++
        ) {
          console.log(apiResponse.associations.companies.results[i]);
          if (
            apiResponse.associations.companies.results[i].type ==
            "child_to_parent_company"
          ) {
            parentCompanyId = apiResponse.associations.companies.results[i].id;
          }
        }
      }

      let dataArray, key;
      dataArray = [];
      for (key in apiResponse.associations) {
        if (
          apiResponse.associations.hasOwnProperty(key) &&
          key != "companies"
        ) {
          for (
            let i = 0;
            i < apiResponse.associations[key].results.length;
            i++
          ) {
            dataArray.push(apiResponse.associations[key].results[i]);
          }
        }
      }

      dataArray.sort((a, b) => b.id - a.id);
      //console.log(dataArray);
      engagementId = dataArray[0].id;
      engagementType = dataArray[0].type;
    }
  } catch (e) {
    e.message === "HTTP request failed"
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e);
  }

  callback({
    outputFields: {
      parentCompanyId,
      engagementId,
      engagementType,
    },
  });
};
