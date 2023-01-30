const hubspot = require('@hubspot/api-client');

exports.main = async (event, callback) => {
  
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.hstoken
  });
  
  const PublicObjectSearchRequest = { 
     filterGroups: [{
      filters:[{
        propertyName: "createdate",
        operator: "GT",
        value: "1"
      }]
    }],
    sorts: [{
        "propertyName": "createdate",
        "direction": "DESCENDING"
      }],
    properties: ["custom_identifier"], 
    limit: 3,
  };
  
  try {
    const searchResponse = await hubspotClient.crm.tickets.searchApi.doSearch(PublicObjectSearchRequest);
    let custom_identifier = searchResponse.results[1].properties.custom_identifier;
    console.log("Latest Identifier",custom_identifier);
    custom_identifier++;
    
    callback({
    outputFields: {
      custom_identifier
    }
  });
    
  }  catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
    : console.error(e)
  }
}
   
