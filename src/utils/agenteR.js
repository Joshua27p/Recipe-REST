const axios = require('axios');
const PurchaseOrderItemModel = require('../models/purchaseOrderItem');

const sendCudsToAgenteR = async (ocs, carPlate, company) => {
  try {
    const carPlateFormatted = carPlate.replace('-','')
    console.log('ocs FORMATTED (FUNCTION: sendCudsToAgenteR) :', ocs);
    const cuds = await PurchaseOrderItemModel.findWithModelAgenteR(ocs, carPlateFormatted, company)
    console.log('CUDS OBJECTS TO SEND AGENTE R:',cuds);
    console.log('CUDS TO SEND AGENTE R:',cuds.map(c => c.cud));
    console.log('carPlate & company TO SEND AGENTE R:', carPlateFormatted, company);
    if(cuds.length > 0) {
      const { data: cudsSentIt } = await axios.post('https://api-retcercano.ripley.com.pe/auth/cud/load', { data: cuds });
      console.log('cudsSentIt Already sent to https://api-retcercano.ripley.com.pe/auth/cud/load :', cudsSentIt);
    }
    return cuds;
  } catch (error) {
    console.log('ERROR CATCHED FUNCTION: sendCudsToAgenteR =>', error)
    console.log('ERROR CATCHED FUNCTION: sendCudsToAgenteR: OCS =>', ocs)
    // console.log('ERROR CATCHED FUNCTION: sendCudsToAgenteR: CUDS =>', cuds);
  }
};

module.exports = {
  sendCudsToAgenteR,
};
