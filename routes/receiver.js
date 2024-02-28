const express = require("express");
const sequelize = require("../db_config");
const base64 = require("base64util");

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

// Function to add a new element to each record in the JSON array
function addNewElement(jsonData, mfl_code, time_stamp, timestamp_unix, pk_column) {
     jsonData.forEach(
       
        record => {
        // Add a new key-value pair to each record
        record.timestamp = timestamp;
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
            
            
          }
       
      });
      return jsonData;
  }

  //Function To Create Data
async function visualizer_records(facility_data, visits_data, workload_data, payments_data, inventory_data, diagnosis_data, billing_data, admissions_data) {
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
const timestampMs = req.body.timestamp * 1000;

// Create a new Date object using the timestamp in milliseconds
const date = new Date(timestampMs);

// Extract the different components of the date
const year = date.getFullYear();
const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
const day = date.getDate().toString().padStart(2, '0');
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const seconds = date.getSeconds().toString().padStart(2, '0');

// Create a string representation of the date and time
const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

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
    console.log(visits);
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






visualizer_records(facility_attributes, visits,workload, payments, inventory,diagnosis,billing, admissions )
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
