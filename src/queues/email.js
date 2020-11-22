const Queue = require('bull');
const { REDIS } = require('../config');
const { WSHOST } = require('../config');
const { sendEmail } = require('../utils/email');
const moment = require('moment');
const PurchaseOrderModel = require('../models/purchaseOrder');
const PurchaseOrderItemModel = require('../models/purchaseOrderItem');
const ManifestModel = require('../models/manifest');
const Exceljs = require('../../node_modules/exceljs/dist/exceljs');
const emailsQueue = new Queue('emails', 'redis://' + REDIS);
const axios = require('axios');
const https = require('https');
const database = require('../modules/knex');
const { v4 } = require('uuid');
const { Console } = require('console');
const { sendCudsToAgenteR } = require('../utils/agenteR');

const axiosAgent = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

processAsync = async (orderNumbers, idManifest, carPlate, company) => {
  const excelRows = [];
  const manifestData = [];

  const manifestItem = await ManifestModel.findByFilters({ id: idManifest });

  console.log(manifestItem);

  const purchaseOrders = await PurchaseOrderModel.findOCList(orderNumbers);
  const OCOnManifest = purchaseOrders.map(oc => ({ item: oc.orderNumber }));
  const transactionId = moment().format('YYYYMMDDHHmmss');

  const { data: bigTicketCuds } = await axiosAgent.post(`https://${WSHOST}/ConsultarOrdenCompraWS/rest/oc/${transactionId}`, {
    listaOC: OCOnManifest,
  });

  const btMap = new Map();
  bigTicketCuds.forEach(btc => btMap.set(btc.cud, btc));

  for (let oc of purchaseOrders) {
    /*console.log(oc.orderNumber);*/
    const ocitems = await PurchaseOrderItemModel.findWithProduct({ 'purchase_order_item.orderNumber': oc.orderNumber, manifestId: idManifest });
    /*console.log(ocitems);*/
    for (let item of ocitems) {
      /*console.log("CUD en busqueda:");
      console.log(item.cud);*/
      if( btMap.has(item.cud) ){
        const btCud = btMap.get(item.cud);
        /*console.log(btCud);*/
        if ( btCud.cud == item.cud && btCud.codigoestado == '2' && btCud.btdestipdoc == '1') {
          console.log(`Updating oc ${btCud.oc} / cud ${item.cud} with guideNumber: ${btCud.guia}`);
          await PurchaseOrderItemModel.updateByCUD({ cud: item.cud }, {
            guideNumber: btCud.guia,
            guideDate: btCud.fechaguia,
            btStatus: btCud.codigoestado,
          });

          manifestData.push({
            orderNumber: btCud.oc,
            manifestId: idManifest,
            cud: item.cud,
            ticket: btCud.ticket,
            guideNumber: btCud.guia,
            guideDate: btCud.fechaguia,
            btStatus: btCud.codigoestado,
            excluded: false,
          })

          excelRows.push({
            cudNumber: item.cud,
            phone: oc.clientPhone,
            quantity: item.quantity,
            description: item.description,
            sku: item.sku,
            ticket: btCud.ticket,
            guideNumber: btCud.guia,
            guideDate: btCud.fechaguia,
            name: oc.clientName,
            dni: oc.clientDni,
            district: item.dispatchDistrict,
            city: item.dispatchCity,
            jor: item.stage,
            address: item.dispatchAddress,
            email: oc.clientEmail,
            manifestId: item.manifestId,
            orderNumber: item.orderNumber,
            compromiseDate: item.compromiseDate,
            company: item.company,
            storeName: item.storeName,
            boxSize: item.boxSize,
          });
          const courierDate = moment().tz("America/Lima").format('YYYY-MM-DD HH:mm:ss');
          var dataPost = JSON.stringify(
            {
              "CUD": item.cud,
              "Estado":"En Transito",
              "SubEstado":"Entrega al Operador",
              "Placa": manifestItem[0].carPlate,
              "Courier":manifestItem[0].company,
              "Fecha": courierDate,
              "NombreReceptor":manifestItem[0].carrier,
              "IDReceptor":"",
              "TrackNumber":"",
              "URL":" "
            }
          );

          var config = {
            method: 'post',
            url: 'https://api-couriers.ripley.com.pe/apiCambioEstadoCourier/sendStateCourierOnline',
            headers: {
              'x-api-key': 'nixjV6I6rlvnbvCibNFS97DiGpOaTAU47Z6i8QTi',
              'Content-Type': 'application/json'
            },
            data : dataPost
          };

          axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });
        }
      }
    }
  }

  // await sendCudsToAgenteR(orderNumbers.filter(oc => typeof oc === 'string'), carPlate, company);

  (async () => {
    r0 = await database('purchase_order_item')
      .select('purchase_order_item.manifestId','purchase_order_item.cud','purchase_order_item.orderNumber')
      .where('manifestId', idManifest)
      .where(builder =>
        builder.whereNull('guideNumber').orWhere('guideNumber', '')
    )

    r1 = await database('manifest_history')
        .insert(manifestData.concat(r0))

    if(r0.length > 0){
      r2 = await database('purchase_order_item')
          .where('manifestId', idManifest)
          .where(builder =>
            builder.whereNull('guideNumber').orWhere('guideNumber', '')
          )
          .update({
            manifestId: null,
          });
    };
  })();

  return excelRows;
}

emailsQueue.process((job, done) => {
  const { dests, purchaseOrders, idManifest, carPlate, company } = job.data;
  console.log('emailsQueue.process',idManifest);
  let queueJobID = v4();
  console.log('jobId',queueJobID);

  let rows = [];
  (async () => {
    queryJobID = await database('manifest')
    .returning('jobId')
    .where('id', idManifest)
    .whereNull('jobId')
    .update({
      jobId: queueJobID,
    });

    console.log(queryJobID);

    if(queryJobID.length > 0){
      (async () => {
        console.log('PROCCESSING FUNCTION PROCESSASYNC1');
        rows = await processAsync(purchaseOrders, idManifest, carPlate, company);
        console.log('carPlateeeeeeeee :', carPlate);
        await sendCudsToAgenteR(purchaseOrders.filter(oc => typeof oc === 'string'), carPlate, company);
    })();

    const wb = new Exceljs.Workbook();
    const sheet = wb.addWorksheet('Hoja 1');
    sheet.columns = [
      { header: 'Fecha de guía', key: 'guideDate' },
      { header: 'Código de venta', key: 'sku' },
      { header: 'Descripción', key: 'description' },
      { header: 'Cantidad', key: 'quantity' },
      { header: 'Distrito', key: 'district' },
      { header: 'Ciudad', key: 'city' },
      { header: 'Jornada', key: 'jor' },
      { header: 'Dni despacho', key: 'dni' },
      { header: 'Nombre despacho', key: 'name' },
      { header: 'Dirección despacho', key: 'address' },
      { header: 'Telefono', key: 'phone' },
      { header: 'Dirección correo', key: 'email' },
      { header: 'CUD', key: 'cudNumber' },
      { header: 'Nro de guía', key: 'guideNumber' },
      { header: 'Nro de ticket', key: 'ticket' },
      { header: 'Manifiesto', key: 'manifestId' },
      { header: 'Pedido', key: 'orderNumber' },
      { header: 'Fecha de compromiso', key: 'compromiseDate' },
      { header: 'OPL', key: 'company' },
      { header: 'Tienda', key: 'storeName' },
      { header: 'Tamaño', key: 'boxSize' },
    ];

    console.log('PROCCESSING FUNCTION PROCESSASYNC2');
    processAsync(purchaseOrders, idManifest, carPlate, company)
      .then(rows => {
        sheet.addRows(rows);
        return wb.xlsx.writeBuffer();
      })
      .then(buffer => {
        const requests = [];
        requests.push(sendEmail(dests.join(), buffer.toString('base64'), idManifest, company));
        return Promise.all(requests);
      })
      .then(() => done(null, 'Done'))
      .catch(error => done(new Error(error)));
  }
})();
});

emailsQueue.on('completed', (job, result) => {
  const { idManifest } = job.data;
  console.log(`Job ${idManifest} completed with result: ${result}`);
})

emailsQueue.on('error', error => {
  console.log(`Error email worker: ${error}`);
});

const addEmailToQueue = (dests, purchaseOrders, idManifest, carPlate, company) => {
    const options = {
      attempts: 2,
      jobId: v4(),
    };

    emailsQueue.add({ dests, purchaseOrders, idManifest, carPlate, company }, options);
};

const purgeEmailToQueue = () => {

  console.log('Purge emailsQueue.');

  emailsQueue.clean(0, 'delayed');
  emailsQueue.clean(0, 'wait');
  emailsQueue.clean(0, 'active');
  emailsQueue.clean(0, 'completed');
  emailsQueue.clean(0, 'failed');
};

module.exports = {
  addEmailToQueue,
  purgeEmailToQueue,
};
