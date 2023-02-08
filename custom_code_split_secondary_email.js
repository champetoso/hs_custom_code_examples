const hubspot = require('@hubspot/api-client');

exports.main = async (event, callback) => {

  const hubspotClient = new hubspot.Client({
    accessToken: process.env.hstoken //change "hstoken" for the name of your HS API Token secret
  });
  const recordId = event.object.objectId;

  try {
    
    //Fetch secondary emails
    let secondaryEmails = [];
    const secondaryEmailResponse = await hubspotClient
				.apiRequest({
					method: 'GET',
					path: `/contacts/v1/secondary-email/${recordId}`,
					body: {}
				});
    secondaryEmails = secondaryEmailResponse.body.secondaryEmails;
    
    //If secondary emails exist, then loop through them
    if (secondaryEmails.length>0){
      
      for (let i=0; i < secondaryEmails.length; i++){
        
        //Delete secondary email from original contact
        const email = secondaryEmails[i];
        const deleteSecondaryEmailResponse = await hubspotClient
				.apiRequest({
					method: 'DELETE',
					path: `/contacts/v1/secondary-email/${recordId}/email/${email}`,
					body: {}
				});
        console.log(JSON.stringify(deleteSecondaryEmailResponse.body, null, 2));
        
        //Create new contact using deleted email
        const properties = {email: secondaryEmails[i]};
        const SimplePublicObjectInput = { properties };
        const apiResponse = await hubspotClient.crm.contacts.basicApi.create(SimplePublicObjectInput);
        
        console.log(JSON.stringify(apiResponse.body, null, 2));
        
      }
      
    } else {
      throw new Error ("No secondary emails");
    }
    
  } catch (err) {
    console.error(err);
    throw err;
  }
}
