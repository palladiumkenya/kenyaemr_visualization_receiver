const express = require("express");
const sequelize = require("../db_config");
const base64 = require("base64util");
require("dotenv").config();
const request = require('request');

const http = require('https');


const router = express.Router();
// const bcrypt = require("bcrypt");
const _ = require("lodash");

const {Admissions} = require("../models/admissions");
const {Billing} = require("../models/billing");
const {Diagnosis} = require("../models/diagnosis");
const {Discharges} = require("../models/discharges");
const {Inventory} = require("../models/inventory");
const {Payments} = require("../models/payments");
const {Visits} = require("../models/visits");
const {Workload} = require("../models/workload");
const {Mortality} = require("../models/mortality");

//Test Cases Models
const {AdmissionsTest} = require("../models/admissions_test");
const {BillingTest} = require("../models/billing_test");
const {DiagnosisTest} = require("../models/diagnosis_test");
const {DischargesTest} = require("../models/discharges_test");
const {InventoryTest} = require("../models/inventory_test");
const {PaymentsTest} = require("../models/payments_test");
const {VisitsTest} = require("../models/visits_test");
const {WorkloadTest} = require("../models/workload_test");
const {MortalityTest} = require("../models/mortality_test");

//Check Empty Json
function isEmptyJSON(jsonObject) {
    return JSON.stringify(jsonObject) === '{}' || JSON.stringify(jsonObject) === '[]';
}

//Pull Facility Locator Information ie Name, County & Sub County from HIS list
function fetchData(mfl_code) {
    const options = {
        rejectUnauthorized: false
      };
    return new Promise((resolve, reject) => {
        http.get(process.env.HIS_LIST+mfl_code,options, (response) => {
            let data = '';

            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData); // Resolve the promise with parsed data
                } catch (error) {
                    reject(error); // Reject the promise if parsing fails
                }
            });
        }).on('error', (error) => {
            reject(error); // Error making the request
        });
    });
}



// Function to add a new element to each record in the JSON array
function addNewElement(jsonData, mfl_code, time_stamp, timestamp_unix, pk_column) {
     jsonData.forEach(
       
        record => {
        // Add a new key-value pair to each record
        record.timestamp = time_stamp;
        record.mfl_code = mfl_code;
        //Generate PK field Value based on the Received Object data
        switch(pk_column) {
            case 'visits':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.visit_type);
            break;
            case 'workload':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.department);
            break;
            case 'payments':
            record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.payment_mode);
            break;
            case 'inventory':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.item_type+record.item_name);
            break;
            case 'diagnosis':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.diagnosis_name);
            break;
            case 'billing':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.service_type);
            break;
            case 'admissions':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.ward);
            break;
            case 'mortality':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.cause_of_death);
            break;
            
            
          }
       
      });
      return jsonData;
  }

//Function To Create Data
async function visualizer_records(facility_data, visits_data, workload_data, payments_data, inventory_data, diagnosis_data, billing_data, admissions_data, mortality_data) {
    let transaction;
    try {
      // Start a transaction
      transaction = await sequelize.sequelize.transaction();
  
        // Create multiple records within the transaction
        if (_.isEmpty(visits_data) == false) {
            const visits_created = await Visits.bulkCreate(visits_data, {
                updateOnDuplicate: ['total'] // Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }
      
        if (_.isEmpty(workload_data) == false) {
            const workload_created = await Workload.bulkCreate(workload_data, {
                updateOnDuplicate: ['total'] // Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }


        if (_.isEmpty(payments_data) == false) {
            const payments_created = await Payments.bulkCreate(payments_data, {
                updateOnDuplicate: ['no_of_patients', 'amount_paid'] // Update the 'Total' field if the timestamp and visit type is same
                // updateOnDuplicate: ['no_of_patients'] // Update the 'Total' field if the timestamp and visit type is same

            }, { transaction });
        }

        if (_.isEmpty(inventory_data) == false) {
            const inventory_created = await Inventory.bulkCreate(inventory_data, {
                updateOnDuplicate: ['unit_of_measure', 'quantity_at_hand', 'quantity_consumed'] // Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }
   
        if (_.isEmpty(diagnosis_data) == false) {
            const diagnosis_created = await Diagnosis.bulkCreate(diagnosis_data, {
                updateOnDuplicate: ['total']// Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }

        if (_.isEmpty(billing_data) == false) {
            const billing_created = await Billing.bulkCreate(billing_data, {
                // updateOnDuplicate: ['invoices_total']['amount_due']['amount_paid']['balance_due'] // Update the 'Total' field if the timestamp and visit type is same
                updateOnDuplicate: ['invoices_total', 'amount_due', 'amount_paid', 'balance_due'] // Update the 'Total' field if the timestamp and visit type is same

            }, { transaction });
        }


        if (_.isEmpty(admissions_data) == false) {
            const admission_created = await Admissions.bulkCreate(admissions_data, {
                updateOnDuplicate: ['capacity', 'occupancy', 'new_admissions']// Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }


        
        if (_.isEmpty(mortality_data) == false) {
            const mortality_created = await Mortality.bulkCreate(mortality_data, {
                updateOnDuplicate: ['cause_of_death', 'total']// Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }

     
     

      // If everything is successful, commit the transaction
      await transaction.commit();
  
      return facility_data;
    } catch (error) {
      // If any errors occur, rollback the transaction
      if (transaction) await transaction.rollback();
      throw error;
    }
  }


router.post("/", async (req, res) => {

//Receive Payload
var mfl_code=req.body.mfl_code;

// Convert the UNIX timestamp to milliseconds
const timestamp_unix = req.body.timestamp;
//const timestampMs = req.body.timestamp * 1000;

// Create a new Date object using the timestamp in milliseconds


// Extract the different components of the date
const year = timestamp_unix.substring(0,4);
const month =timestamp_unix.substring(4, 6); // Months are 0-based
const day = timestamp_unix.substring(6, 8);
const hours = timestamp_unix.substring(8, 10);
const minutes = timestamp_unix.substring(10, 12);
const seconds = timestamp_unix.substring(12, 14);

// Create a string representation of the date and time
const timestamp = year+'-'+ month+'-'+day+' '+hours+':'+minutes+':'+seconds;
const facility_details = await fetchData(mfl_code);
if((isEmptyJSON(facility_details.facilities)==true) || (facility_details.facilities === undefined))
{
    return  res.status(500).json({ success: false,
        msg: 'An Error Occurred, Missing Facility Locator Information',
        data: {
            "timestamp": timestamp,
            "mfl_code": mfl_code,
        } ,
      });

}


var county=facility_details.facilities[0]._county;
var sub_county=facility_details.facilities[0]._subcounty;
var facility_name=facility_details.facilities[0].name;
 

let facility_attributes = {
    "timestamp": timestamp,
    "mfl_code": mfl_code,
    "county":county,
    "sub_county":sub_county,
    "facility_name":facility_name
}  
//Admissions
console.log(facility_attributes);

    //Add Facility Attributes
    //check if object exists or is empty
    if(_.isEmpty(req.body.visits)==false)
    {
        var visits = addNewElement(req.body.visits, mfl_code, timestamp, timestamp_unix, 'visits');        
    }else {
        var visits = {};
    }
    //console.log(visits);
    if(_.isEmpty(req.body.workload) == false)
    {
        var workload = addNewElement(req.body.workload, mfl_code, timestamp, timestamp_unix, 'workload');
    }else{
        var workload = {};
    }

    if(_.isEmpty(req.body.payments) == false)
    {
        var payments = addNewElement(req.body.payments, mfl_code, timestamp, timestamp_unix, 'payments');
    }else {
        var payments = {};
    }

    if(_.isEmpty(req.body.inventory) == false)
    {
        var inventory = addNewElement(req.body.inventory, mfl_code, timestamp, timestamp_unix, 'inventory');
    }else {
        var inventory = {};
    }

    if(_.isEmpty(req.body.diagnosis) == false)
    {
        var diagnosis = addNewElement(req.body.diagnosis, mfl_code, timestamp, timestamp_unix, 'diagnosis');
    }else{
        var diagnosis = {};
    }

    if(_.isEmpty(req.body.billing) == false)
    {
        var billing = addNewElement(req.body.billing, mfl_code, timestamp, timestamp_unix, 'billing');
    }else{
        var billing = {};

    }

    if(_.isEmpty(req.body.bed_management) == false)
    {
        var admissions = addNewElement(req.body.bed_management, mfl_code, timestamp, timestamp_unix, 'admissions');
    } else {
        var admissions = {};
    }


    if(_.isEmpty(req.body.mortality) == false)
    {
        var mortality = addNewElement(req.body.mortality, mfl_code, timestamp, timestamp_unix, 'mortality');
    } else {
        var mortality = {};
    }







visualizer_records(facility_attributes, visits,workload, payments, inventory,diagnosis,billing, admissions, mortality )
  .then(
    facility_attributes => {
      return  res.status(200).json({success: true, 
            msg: 'Record/s Created Successfully',
            data: facility_attributes,
        });

      }
    
   // output=true           
  )
  .catch(
    facility_attributes => {
        return  res.status(500).json({ success: false,
            msg: 'An Error Occurred, Could Not Create Record',
            data: facility_attributes,
          });
  
        })

   
});





///TEST INSTANCE



//Function To Create Data
async function visualizer_records_test(facility_data, visits_data, workload_data, payments_data, inventory_data, diagnosis_data, billing_data, admissions_data, mortality_data) {
    let transaction;
    try {
      // Start a transaction
      transaction = await sequelize.sequelize.transaction();
  
        // Create multiple records within the transaction
        if (_.isEmpty(visits_data) == false) {
            const visits_created = await VisitsTest.bulkCreate(visits_data, {
                updateOnDuplicate: ['total'] // Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }
      
        if (_.isEmpty(workload_data) == false) {
            const workload_created = await WorkloadTest.bulkCreate(workload_data, {
                updateOnDuplicate: ['total'] // Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }


        if (_.isEmpty(payments_data) == false) {
            const payments_created = await PaymentsTest.bulkCreate(payments_data, {
                updateOnDuplicate: ['no_of_patients', 'amount_paid'] // Update the 'Total' field if the timestamp and visit type is same
                // updateOnDuplicate: ['no_of_patients'] // Update the 'Total' field if the timestamp and visit type is same

            }, { transaction });
        }

        if (_.isEmpty(inventory_data) == false) {
            const inventory_created = await InventoryTest.bulkCreate(inventory_data, {
                updateOnDuplicate: ['unit_of_measure', 'quantity_at_hand', 'quantity_consumed'] // Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }
   
        if (_.isEmpty(diagnosis_data) == false) {
            const diagnosis_created = await DiagnosisTest.bulkCreate(diagnosis_data, {
                updateOnDuplicate: ['total']// Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }

        if (_.isEmpty(billing_data) == false) {
            const billing_created = await BillingTest.bulkCreate(billing_data, {
                // updateOnDuplicate: ['invoices_total']['amount_due']['amount_paid']['balance_due'] // Update the 'Total' field if the timestamp and visit type is same
                updateOnDuplicate: ['invoices_total', 'amount_due', 'amount_paid', 'balance_due'] // Update the 'Total' field if the timestamp and visit type is same

            }, { transaction });
        }


        if (_.isEmpty(admissions_data) == false) {
            const admission_created = await AdmissionsTest.bulkCreate(admissions_data, {
                updateOnDuplicate: ['capacity', 'occupancy', 'new_admissions']// Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }


        
        if (_.isEmpty(mortality_data) == false) {
            const mortality_created = await MortalityTest.bulkCreate(mortality_data, {
                updateOnDuplicate: ['cause_of_death', 'total']// Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }

     
     

      // If everything is successful, commit the transaction
      await transaction.commit();
  
      return facility_data;
    } catch (error) {
      // If any errors occur, rollback the transaction
      if (transaction) await transaction.rollback();
      throw error;
    }
  }


router.post("/test", async (req, res) => {

    //Receive Payload
    var mfl_code=req.body.mfl_code;
    
    // Convert the UNIX timestamp to milliseconds
    const timestamp_unix = req.body.timestamp;
    //const timestampMs = req.body.timestamp * 1000;
    
    // Create a new Date object using the timestamp in milliseconds
    
    
    // Extract the different components of the date
    const year = timestamp_unix.substring(0,4);
    const month =timestamp_unix.substring(4, 6); // Months are 0-based
    const day = timestamp_unix.substring(6, 8);
    const hours = timestamp_unix.substring(8, 10);
    const minutes = timestamp_unix.substring(10, 12);
    const seconds = timestamp_unix.substring(12, 14);
    
    // Create a string representation of the date and time
    const timestamp = year+'-'+ month+'-'+day+' '+hours+':'+minutes+':'+seconds;
    
    console.log(timestamp);
    
    let facility_attributes = {
        "timestamp": timestamp,
        "mfl_code": mfl_code
    }  
    //Admissions
    
        //Add Facility Attributes
        //check if object exists or is empty
        if(_.isEmpty(req.body.visits)==false)
        {
            var visits = addNewElement(req.body.visits, mfl_code, timestamp, timestamp_unix, 'visits');        
        }else {
            var visits = {};
        }
        //console.log(visits);
        if(_.isEmpty(req.body.workload) == false)
        {
            var workload = addNewElement(req.body.workload, mfl_code, timestamp, timestamp_unix, 'workload');
        }else{
            var workload = {};
        }
    
        if(_.isEmpty(req.body.payments) == false)
        {
            var payments = addNewElement(req.body.payments, mfl_code, timestamp, timestamp_unix, 'payments');
        }else {
            var payments = {};
        }
    
        if(_.isEmpty(req.body.inventory) == false)
        {
            var inventory = addNewElement(req.body.inventory, mfl_code, timestamp, timestamp_unix, 'inventory');
        }else {
            var inventory = {};
        }
    
        if(_.isEmpty(req.body.diagnosis) == false)
        {
            var diagnosis = addNewElement(req.body.diagnosis, mfl_code, timestamp, timestamp_unix, 'diagnosis');
        }else{
            var diagnosis = {};
        }
    
        if(_.isEmpty(req.body.billing) == false)
        {
            var billing = addNewElement(req.body.billing, mfl_code, timestamp, timestamp_unix, 'billing');
        }else{
            var billing = {};
    
        }
    
        if(_.isEmpty(req.body.bed_management) == false)
        {
            var admissions = addNewElement(req.body.bed_management, mfl_code, timestamp, timestamp_unix, 'admissions');
        } else {
            var admissions = {};
        }
    
    
        if(_.isEmpty(req.body.mortality) == false)
        {
            var mortality = addNewElement(req.body.mortality, mfl_code, timestamp, timestamp_unix, 'mortality');
        } else {
            var mortality = {};
        }
    
    
    
    
    
    
    
        visualizer_records_test(facility_attributes, visits,workload, payments, inventory,diagnosis,billing, admissions, mortality )
      .then(
        facility_attributes => {
          return  res.status(200).json({success: true, 
                msg: 'Record/s Created Successfully',
                data: facility_attributes,
            });
    
          }
        
       // output=true           
      )
      .catch(
        facility_attributes => {
            return  res.status(500).json({ success: false,
                msg: 'An Error Occurred, Could Not Create Record',
                data: facility_attributes,
              });
      
            })
    
       
    });
    



module.exports = router;
