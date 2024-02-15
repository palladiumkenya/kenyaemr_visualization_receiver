const express = require("express");
const sequelize = require("../db_config");

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
function addNewElement(jsonData, mfl_code, time_stamp) {
     jsonData.forEach(record => {
        // Add a new key-value pair to each record
        record.time_stamp = time_stamp;
        record.mfl_code = mfl_code;

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
      const visits_created = await Visits.bulkCreate(visits_data, { transaction });
      const workload_created = await Workload.bulkCreate(workload_data, { transaction });
      const payments_created = await Payments.bulkCreate(payments_data, { transaction });
      const inventory_created = await Inventory.bulkCreate(inventory_data, { transaction });
      const diagnosis_created = await Diagnosis.bulkCreate(diagnosis_data, { transaction });
      const billing_created = await Billing.bulkCreate(billing_data, { transaction });
      const admission_created = await Admissions.bulkCreate(admissions_data, { transaction });

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
    "time_stamp": timestamp,
    "mfl_code": mfl_code
}  
//Admissions

//Add Facility Attributes
const visits = addNewElement(req.body.visits,mfl_code,timestamp);
const workload = addNewElement(req.body.workload,mfl_code,timestamp);
const payments = addNewElement(req.body.payments,mfl_code,timestamp);
const inventory = addNewElement(req.body.inventory,mfl_code,timestamp);
const diagnosis = addNewElement(req.body.diagnosis,mfl_code,timestamp);
const billing = addNewElement(req.body.billing,mfl_code,timestamp);
const admissions = addNewElement(req.body.bed_management,mfl_code,timestamp);





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
