const express = require("express");
const app = express();
const cron = require('node-cron');
const axios = require('axios');

const modules = [
	{
		id : 1,
		name : 'Module-17'
	},
	{
		id : 3,
		name : 'Module-31'
	}
]

cron.schedule('1 03 * * *', async () => {
      try {
		      const login = await axios.post(
		        'http://10.192.192.14/UAT_QAD_Reporting/api/ApiAuthentication/Login/apiuser@bat.com/Welc0me#22',
		        {},
		      );

		      if (!login) {
		      	throw 'Login unsuccessfull';
		      }

		      for (const data of modules) {
			      	const date = new Date();
				    const day = ('0' + date.getDate()).slice(-2);
				    const month = ('0' + (date.getMonth() + 1)).slice(-2);
				    const year = date.getFullYear();
				    const dateString = `${year}-${month}-${day}`;
			        const aura = await axios.get(
			          `http://10.192.192.14/UAT_QAD_Reporting/api/ApiLineDDS/GetData/${dateString}/${module.name}`,
			          {
			            headers: {
			              'Content-Type': 'application/json',
			              Authorization: `Bearer ${login.data.data.accessToken}`,
			            },
			          },
			        );

			        if (aura !== null && Object.keys(aura.data).length !== 0) {
			          const getData = aura.data.data;
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

			          let body = {
			          	success : true,
			          	data : finalData
			          }

			          let savedData = axios.post('http://202.53.174.247:4081/aura/dailyData', body);
			          if(!savedData) {
			          	throw 'Data Not Saved Successfull'
			          }
		        	}
		      }
	    } catch (error) {
	      throw error.message
	    }
});

app.listen(8000,() => {
	console.log('App is running on port 8000')
})