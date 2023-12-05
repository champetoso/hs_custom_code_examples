const hubspot = require("@hubspot/api-client");

exports.main = async (event, callback) => {
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.ACCESS_TOKEN,
  });

  const dealId = event.inputFields["hs_object_id"];
  const properties = ["amount", "dealname", "pipeline", "hubspot_owner_id"];
  const propertiesWithHistory = undefined;
  const associations = ["contacts", "companies", "line_items"];
  const archived = false;
  const idProperty = undefined;

  /*const properties = {
  "amount": "1500.00",
  "closedate": "2019-12-07T16:50:06.678Z",
  "dealname": "Custom data integrations",
  "dealstage": "presentationscheduled",
  "pipeline": "default"
};
const SimplePublicObjectInputForCreate = { properties, associations: [{"to":{"id":"101"},"types":[{"associationCategory":"HUBSPOT_DEFINED","associationTypeId":2}]}] };*/

  try {
    //const apiResponse = await hubspotClient.crm.pipelines.pipelinesApi.getAll('deals');
    //console.log(JSON.stringify(apiResponse, null, 2));

    const readResponse = await hubspotClient.crm.deals.basicApi.getById(
      dealId,
      properties,
      propertiesWithHistory,
      associations,
      archived,
      idProperty
    );
    console.log(JSON.stringify(readResponse, null, 2));
    const propertiesData = readResponse.properties;
    propertiesData.dealname = propertiesData.dealname + " (renewal)";
    propertiesData["dealstage"] = "appointmentscheduled";
    delete propertiesData["hs_object_id"];
    delete propertiesData["hs_lastmodifieddate"];
    delete propertiesData["createdate"];
    const associationsData = readResponse.properties;
    let associationsList = new Array();

    if (associationsData.companies.results) {
      for (let i = 0; i < associationsData.companies.results.length; i++) {
        if (associationsData.companies.results[i].type == "deal_to_company") {
          const obj = {
            to: { id: associationsData.companies.results[i].id },
            types: [
              { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 6 },
            ],
          };
          associationsList.append(obj);
        }
      }
    }

    if (associationsData.contacts.results) {
      for (let i = 0; i < associationsData.contacts.results.length; i++) {
        const obj = {
          to: { id: associationsData.contacts.results[i].id },
          types: [
            { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 4 },
          ],
        };
        associationsList.append(obj);
      }
    }

    if (associationsData["line items"].results) {
      for (let i = 0; i < associationsData["line items"].results.length; i++) {
        const obj = {
          to: { id: associationsData["line items"].results[i].id },
          types: [
            { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 20 },
          ],
        };
        associationsList.append(obj);
      }
    }

    /*const SimplePublicObjectInputForCreate = { properties: propertiesData };
  const createResponse = await hubspotClient.crm.deals.basicApi.create(SimplePublicObjectInputForCreate);
  console.log(JSON.stringify(createResponse, null, 2));*/
  } catch (e) {
    e.message === "HTTP request failed"
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e);
  }
}
