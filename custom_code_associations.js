//This code is to associate a custom object (Member Application) to a deal and a contact, based on properties shared between contact, deals and custom object.

const hubspot = require('@hubspot/api-client');

exports.main = async (event, callback) => {

  const hubspotClient = new hubspot.Client({
    accessToken: process.env.hstoken //"hstoken" pulled from Secrets
  });
 
  //General inputs
  const contactEmail = event.inputFields['memberapplication_name'];
  const objectType = 'memberapplication'; //This is the name of the Custom Object
  const applicationId = event.inputFields['hs_object_id'];
  const toObjectTypeDeal = "deal";
  const toObjectTypeContact = "contact";
  const toDealId = event.inputFields['group_application_id']; //DealID is a property that is stored in the custom object too, so it's the reference for association
  const associationTypeContact = 'member_application_to_contact';
  const associationTypeDeal = 'member_application_to_deal';
  
  //Search Constants
  const filter = { propertyName: 'email', operator: 'EQ', value: contactEmail }
  const filterGroup = { filters: [filter] }
  const sort = JSON.stringify({ propertyName: 'id', direction: 'DESCENDING' })
  const properties = ['id']
  const limit = 10
  const after = 0
  
  //Search criteria parameters
  const publicObjectSearchRequest = {
    filterGroups: [filterGroup],
    sorts: [sort],
    properties,
    limit,
    after,
  }
  
  try {
    
    //Search Contact. This will find the contact id, based on Email criteria.
    const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch(publicObjectSearchRequest);
    console.log("searchResponse contactId:",JSON.stringify(searchResponse.body.results[0].id, null, 2));
    
    //Associate to Contact. This will associate the custom object record to a contact.
    const contactResponse = await hubspotClient.crm.objects.associationsApi.create(objectType, applicationId, toObjectTypeContact, searchResponse.body.results[0].id, associationTypeContact);
    console.log("contactResponse:",JSON.stringify(contactResponse.body, null, 2));
    
    //Associate to Deal. This will associate the custom object record to a deal.
    const dealResponse = await hubspotClient.crm.objects.associationsApi.create(objectType, applicationId, toObjectTypeDeal, toDealId, associationTypeDeal);
    console.log("dealResponse:",JSON.stringify(dealResponse.body, null, 2));
    
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
    : console.error(e)
  }
}
