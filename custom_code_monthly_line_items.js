const hubspot = require("@hubspot/api-client");

const GRACE_MONTHS = 3;

exports.main = async (event, callback) => {
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.hstoken,
  });
  const dealId = event.inputFields["hs_object_id"];
  const startDateUnix = event.inputFields["contract_start_date"] * 1;
  const endDateUnix = event.inputFields["contract_end_date"] * 1;
  const amount = event.inputFields["amount"];

  /*****
  	Calculate # start dates for each line item
  *****/

  const startDate = new Date(startDateUnix * 1);
  const endDate = new Date(endDateUnix * 1);
  const monthsDiff =
    endDate.getMonth() -
    startDate.getMonth() +
    12 * (endDate.getFullYear() - startDate.getFullYear()) -
    GRACE_MONTHS;

  /*var datesList = new Array();
  for (let i = 0; i < monthsDiff; i++) {
    const date = new Date(startDate.setMonth(startDate.getMonth() + i));
    datesList.push(date);
  }*/

  console.log("months", monthsDiff);

  /*****
  	Create Line Items
  *****/

  var lineItemsArray = new Array();
  var associationsArray = new Array();

  for (let i = 0; i < monthsDiff; i++) {
    var newDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + i,
      startDate.getDay()
    );
    //newDate = newDate.setMonth(newDate.getMonth()+GRACE_MONTHS);
    var month = newDate.getMonth() + 1;
    //var name = "Facturacion - " + month + " / " + newDate.getFullYear();
    var invoice_month = i + 1;
    var name = "Invoice - " + invoice_month;

    const properties = {
      name,
      hs_product_id: "1996326731",
      hs_recurring_billing_period: "P1M",
      hs_recurring_billing_start_date: newDate,
      recurringbillingfrequency: "monthly",
      quantity: 1,
      price: amount / monthsDiff,
    };

    const SimplePublicObjectInputForCreate = {
      properties,
    };

    lineItemsArray.push(SimplePublicObjectInputForCreate);
  }

  const BatchInputSimplePublicObjectInputForCreate = {
    inputs: lineItemsArray,
  };

  try {
    const apiCreateResponse = await hubspotClient.crm.lineItems.batchApi.create(
      BatchInputSimplePublicObjectInputForCreate
    );

    const createdRecords = apiCreateResponse.results.map((a) => a.id);

    for (let i = 0; i < createdRecords.length; i++) {
      const association = {
        _from: { id: createdRecords[i] },
        to: { id: dealId },
        type: "line_item_to_deal",
      };
      associationsArray.push(association);
    }
    const fromObjectType = "line_item";
    const toObjectType = "deal";
    const BatchInputPublicAssociation = { inputs: associationsArray };

    const apiAssociateResponse =
      await hubspotClient.crm.associations.batchApi.create(
        fromObjectType,
        toObjectType,
        BatchInputPublicAssociation
      );
    console.log(JSON.stringify(apiAssociateResponse, null, 2));
  } catch (e) {
    e.message === "HTTP request failed"
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e);
  }
};
