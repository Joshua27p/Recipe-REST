const axios = require('axios');

const sendEmail = (dest, excel, idManifest, company) => {
  return axios.post('https://do01o7m3pa.execute-api.us-east-1.amazonaws.com/dev/SendEmailLF', {
      to: dest,
      subject: `Manifiesto - ${company} - ${idManifest}`,
      html: `
        <h1>Manifiesto</h1>
        <p>El archivo fue creado concluyendo exitoso. </p>
      `,
      attachments: [{
        filename: `${idManifest}.xlsx`,
        content: excel,
        encoding: 'base64',
      }],
  });
};

module.exports = {
  sendEmail,
};
