const express = require('express');
const app = express();
const cron = require('node-cron');
const axios = require('axios');

cron.schedule('*/59 * * * *', async () => {
  try {
    const moduleResult = await axios.get('http://202.53.174.247:4081/module')
    let modules = moduleResult?.data?.data

    const userid = 'apiuser@bat.com';
    const password = 'Welc0me#22';
    const login = await axios.post(
      'http://10.192.192.14/UAT_QAD_Reporting/api/ApiAuthentication/Login',
      null,
      {
        params: {
          userid,
          password,
        },
      },
    );

    if (login) {
      for (const module of modules) {
        const date = new Date();
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        const dateString = `${year}-${month}-${day}`;
        const aura = await axios.get(
          `http://10.192.192.14/UAT_QAD_Reporting/api/ApiLineDDS/GetData`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${login.data.token}`,
            },
            params: {
              date: dateString,
              Module: module?.name,
            },
          },
        );
  
        if (aura?.data?.length > 0) {
          const getData = aura?.data;
          const finalData = [];
          for (const singleData of getData) {
            finalData.push({
              date: singleData.DATE,
              module: singleData.Module,
              brand: singleData.Brand,
              makerPercentage: singleData.Maker_Percentage,
              ragStatus: singleData.RAG_Status,
              qAlert: singleData.Q_Alert,
              noOfNCP: singleData.No_of_NCP,
            });
          }
  
          const body = {
            success: true,
            data: finalData,
          };
  
          const savedData = await axios.post(
            'http://202.53.174.247:4081/aura/dailyData',
            body,
          );
  
          if (!savedData) {
            console.log('Data Not Saved Successfull')
            throw new Error('Data Not Saved Successfull');
          }
        }
      }
    }
  } catch (error) {
    console.log('Date & Time --> ', new Date().toLocaleString());
    console.log('Error message -->', error.message)
    console.log('Error url -->', error.config.url);
    console.log('Response Data -->', error.config.data);
    throw new Error(error);
  }
});

app.listen(8000, () => {
  console.log('App is running on port 8000');
});
