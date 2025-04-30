const express = require("express");
const sequelize = require("../db_config_test");
const base64 = require("base64util");
require("dotenv").config();
const request = require('request');

const http = require('https');


const router = express.Router();
// const bcrypt = require("bcrypt");
const _ = require("lodash");

const {Admissions} = require("../models/admissions_test");
const {Billing} = require("../models/billing_test");
const {Diagnosis} = require("../models/diagnosis_test");
const {Discharges} = require("../models/discharges_test");
const {Inventory} = require("../models/inventory_test");
const {Payments} = require("../models/payments_test");
const {Visits} = require("../models/visits_test");
const {Workload} = require("../models/workload_test");
const {Mortality} = require("../models/mortality_test");


const {Waittime} = require("../models/waittime_test");

const {Immunization} = require("../models/immunization_test");
const {OPD_Visits_Services} = require("../models/opd_visits_service_test");
const {Revenue_by_department} = require("../models/revenue_by_department_test");
const {Staff} = require("../models/staff_test");
const {Waivers} = require("../models/waivers_test");
const {OPD_Visits_Age} = require("../models/opd_visits_age_test");

const {Version} = require("../models/version_test");
const {ShaEnrol} = require("../models/sha_enrollment_test");

//Check Empty Json
function isEmptyJSON(jsonObject) {
    return JSON.stringify(jsonObject) === '{}' || JSON.stringify(jsonObject) === '[]';
}

// Function to recursively convert keys to lowercase
function convertKeysToLowercase(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => convertKeysToLowercase(item));
    } else if (typeof obj === "object" && obj !== null) {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key.toLowerCase()] = convertKeysToLowercase(obj[key]);
        return acc;
      }, {});
    } else {
      return obj;
    }
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
function addNewElement(jsonData, mfl_code,facility_name,county, sub_county, time_stamp, timestamp_unix, pk_column) {
     jsonData.forEach(
       
        record => {
        // Add a new key-value pair to each record
        record.timestamp = time_stamp;
        record.mfl_code = mfl_code;
        record.facility_name = facility_name;
        record.county = county;
        record.sub_county = sub_county;
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
            case 'waittime':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.queue);
            break;

            case 'immunization':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.vaccine);
            break;

            case 'revenue_by_department':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.department);
            break;
            case 'opd_visit_by_service_type':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.service);
            break;

            case 'staff_count':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.staff);
            break;

            case 'waivers':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.waivers);
            break;

            case 'opd_visits':
                record.record_pk =  base64.encode(mfl_code+timestamp_unix+record.age);
            break;
            
            
          }
       
      });
      return jsonData;
  }

//Function To Create Data
async function visualizer_records(facility_data, visits_data, workload_data, payments_data, inventory_data, diagnosis_data, billing_data, admissions_data, mortality_data, waittime_data, immunization_data, opd_visits_services_data, revenue_data, staff_data, waivers_data, opd_visits_age_data, version_data, sha_enrollment_data) {
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


        if (_.isEmpty(waittime_data) == false) {
            const waittime_created = await Waittime.bulkCreate(waittime_data, {
                updateOnDuplicate: ['queue', 'average_wait_time']// Update the 'Total' field if the timestamp and visit type is same
            }, { transaction });
        }


        
        if (_.isEmpty(immunization_data) == false) {
            const immunization_created = await Immunization.bulkCreate(immunization_data, {
                updateOnDuplicate: ['total']// Update the Vaccine & Total
            }, { transaction });
        }

        if (_.isEmpty(opd_visits_services_data) == false) {
            const opd_visits_service_created = await OPD_Visits_Services.bulkCreate(opd_visits_services_data, {
                updateOnDuplicate: ['total']// Update the Service/Department & Total
            }, { transaction });
        }


        if (_.isEmpty(revenue_data) == false) {
            const revenue_created = await Revenue_by_department.bulkCreate(revenue_data, {
                updateOnDuplicate: ['patient_count', 'amount']// Update the Department Patient & Total
            }, { transaction });
        }


        if (_.isEmpty(staff_data) == false) {
            const staff_created = await Staff.bulkCreate(staff_data, {
                updateOnDuplicate: [ 'staff_count']// Update the Department Patient & Total
            }, { transaction });
        }


        if (_.isEmpty(waivers_data) == false) {
            const waivers_created = await Waivers.bulkCreate(waivers_data, {
                updateOnDuplicate: [ 'waivers']// Update the Waiver 
            }, { transaction });
        }
        if (_.isEmpty(opd_visits_age_data) == false) {
            const opd_visits_age_created = await OPD_Visits_Age.bulkCreate(opd_visits_age_data, {
                updateOnDuplicate: ['total']// Update the Service/Department & Total
            }, { transaction });
        }

        if (_.isEmpty(version_data) == false) {
            console.log(version_data);
            const version_created = await Version.create(version_data, {
                updateOnDuplicate: ['version']// Update Version
            }, { transaction });
        }

        if (_.isEmpty(sha_enrollment_data) == false) {
            console.log(sha_enrollment_data);
            const sha_enrolment_created = await ShaEnrol.create(sha_enrollment_data, {
                updateOnDuplicate: ['sha_enrollment']// Update SHA Enrolment Data
            }, { transaction });
        }


        //OPD_Visits_Age
        


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

////var req = convertKeysToLowercase(req_new);
//console.log(req_new);

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

        var visits_nested = req.body.visits
        .filter(visit => visit.category === "visit_type") // Focus on "visit_type"
        .flatMap(visit => visit.details) // Flatten details array
        .map(detail => ({
            visit_type: detail.visit_type || "unknown", // Default if missing
            total: detail.total || "0" // Default to "0" if missing
        })); // Format into desired structure

      


        //Extract Service Type
        var opdVisitByServiceType = req.body.visits
        .filter(visit => visit.category === "service_type") // Focus on "serviceType" category
        .flatMap(visit => visit.details) // Flatten the details array
        .map(service => ({ service: service.service, total: service.total })); // Format each service



         var opdVisits = req.body.visits
        .filter(visit => visit.category === "visit_type") // Focus on "visit_type"
        .flatMap(visit => visit.details) // Flatten the details array
        .filter(detail => detail.visit_type === "Outpatient") // Focus on Outpatient visits
        .flatMap(outpatient => outpatient.age_details) // Extract age details
        .map(ageDetail => ({
            age: ageDetail.age,
            total: ageDetail.total
        })); // Format into desired structure

              
      
        
    }else {
        var visits = {};
        
    }


    //console.log(visits);
    if(_.isEmpty(visits_nested) == false)
        {
            var visits_nested = addNewElement(visits_nested, mfl_code, facility_name,county, sub_county, timestamp, timestamp_unix, 'visits');
        }else{
            var visits_nested = {};
        }
    
    //console.log(visits);
    if(_.isEmpty(req.body.workload) == false)
    {
        var workload = addNewElement(req.body.workload, mfl_code, facility_name,county, sub_county, timestamp, timestamp_unix, 'workload');
    }else{
        var workload = {};
    }

    if(_.isEmpty(req.body.payments) == false)
    {
        

        var revenueByDepartment = req.body.payments
        .filter(payment => payment.category === "department") // Focus on "department" category
        .flatMap(payment => payment.details) // Flatten details array
        .map(department => ({
            department: department.department,
            patient_count: department.patient_count || "0", // Default patient_count to "0" if missing
            amount: department.amount || department.amount_paid || "0.00" // Handle amount field variations
        })); // Format the details



        // Extract revenue by payment mode
        var revenueByPaymentMode = req.body.payments
        .filter(payment => payment.category === "payment_mode") // Focus on "payment_mode" category
        .flatMap(payment => payment.details) // Flatten details array
        .map(paymentMode => ({
        payment_mode: paymentMode.payment_mode,
        no_of_patients: paymentMode.no_of_patients || "0", // Default patient count to "0" if missing
        amount_paid: paymentMode.amount_paid || "0.00" // Default amount to "0.00" if missing
        })); // Format the details
    }else {
        var payments = {};
    }


    if(_.isEmpty(revenueByPaymentMode) == false)
    {
        var payments = addNewElement(revenueByPaymentMode, mfl_code, facility_name,county, sub_county, timestamp, timestamp_unix, 'payments');
    }else {
        var payments = {};
    }

    if(_.isEmpty(req.body.inventory) == false)
    {
        var inventory = addNewElement(req.body.inventory, mfl_code,facility_name,county, sub_county, timestamp, timestamp_unix, 'inventory');
    }else {
        var inventory = {};
    }

    if(_.isEmpty(req.body.diagnosis) == false)
    {
        var diagnosis = addNewElement(req.body.diagnosis, mfl_code,facility_name,county, sub_county, timestamp, timestamp_unix, 'diagnosis');
    }else{
        var diagnosis = {};
    }

    if(_.isEmpty(req.body.billing) == false)
    {
        var billing = addNewElement(req.body.billing, mfl_code,facility_name,county, sub_county, timestamp, timestamp_unix, 'billing');
    }else{
        var billing = {};

    }

    if(_.isEmpty(req.body.bed_management) == false)
    {
        var admissions = addNewElement(req.body.bed_management, mfl_code,facility_name,county, sub_county, timestamp, timestamp_unix, 'admissions');
    } else {
        var admissions = {};
    }


    if(_.isEmpty(req.body.mortality) == false)
    {
        var mortality = addNewElement(req.body.mortality, mfl_code, facility_name,county, sub_county,timestamp, timestamp_unix, 'mortality');
    } else {
        var mortality = {};
    }

    if(_.isEmpty(req.body.wait_time) == false)
    {
        var waittime = addNewElement(req.body.wait_time, mfl_code, facility_name,county, sub_county,timestamp, timestamp_unix, 'waittime');
    } else {
        var waittime = {};
    }


    if(_.isEmpty(req.body.immunization) == false)
    {
        var immunization = addNewElement(req.body.immunization, mfl_code, facility_name,county, sub_county,timestamp, timestamp_unix, 'immunization');
    } else {
        var immunization = {};
    }

    if(_.isEmpty(req.body.Immunization) == false)
        {
            var immunization = addNewElement(req.body.Immunization, mfl_code, facility_name,county, sub_county,timestamp, timestamp_unix, 'immunization');
        } else {
            var immunization = {};
        }

    if(_.isEmpty(revenueByDepartment) == false)
    {
        var revenue_by_department = addNewElement(revenueByDepartment, mfl_code, facility_name,county, sub_county,timestamp, timestamp_unix, 'revenue_by_department');
    } else {
        var revenue_by_department = {};
    }

    if(_.isEmpty(opdVisitByServiceType) == false)
    {
        var opd_visit_by_service_type = addNewElement(opdVisitByServiceType, mfl_code, facility_name,county, sub_county,timestamp, timestamp_unix, 'opd_visit_by_service_type');
    } else {
        var opd_visit_by_service_type = {};
    }

    if(_.isEmpty(req.body.staff_count) == false)
    {
            var staff = addNewElement(req.body.staff_count, mfl_code, facility_name,county, sub_county,timestamp, timestamp_unix, 'staff_count');
    } else {
            var staff = {};
    }


    if(_.isEmpty(req.body.waivers) == false)
    {
            var waivers = addNewElement(req.body.waivers, mfl_code, facility_name,county, sub_county,timestamp, timestamp_unix, 'waivers');
    } else {
           var waivers = {};
    }

    
    if(_.isEmpty(opdVisits) == false)
        {
                var opd_visits = addNewElement(opdVisits, mfl_code, facility_name,county, sub_county,timestamp, timestamp_unix, 'opd_visits');
        } else {
               var opd_visits = {};
        }

    if(_.isEmpty(req.body.version) == false)
        {
            var version_data = {
                "timestamp": timestamp,
                "mfl_code": mfl_code,
                "county":county,
                "sub_county":sub_county,
                "facility_name":facility_name,
                "record_pk" : base64.encode(mfl_code+timestamp_unix+req.body.version),
                "version": req.body.version
            }  
               // var version => {req.body.version, mfl_code, facility_name,county, sub_county,timestamp, timestamp_unix};
        } else {
                var version_data = {};
        }

        if (req.body.hasOwnProperty('sha_enrollments') && req.body.sha_enrollments !== null && req.body.sha_enrollments !== '') 
        //if(_.isEmpty(req.body.sha_enrollments) == false)
            {
                const shaValue = String(req.body.sha_enrollments); // ensure it's a string for concatenation

                var sha_enrollment_data = {
                    "timestamp": timestamp,
                    "mfl_code": mfl_code,
                    "county":county,
                    "sub_county":sub_county,
                    "facility_name":facility_name,
                    "record_pk" : base64.encode(mfl_code+timestamp_unix+shaValue),
                    "sha_enrollment": req.body.sha_enrollments
                }  
                   // var version => {req.body.version, mfl_code, facility_name,county, sub_county,timestamp, timestamp_unix};
            } else {
                    var sha_enrollment_data = {};
            }
    

        console.log(req.body.sha_enrollments);
    

    
            
        
    

        




visualizer_records(facility_attributes, visits_nested,workload, payments, inventory,diagnosis,billing, admissions, mortality, waittime, immunization,  opd_visit_by_service_type , revenue_by_department,staff,waivers, opd_visits , version_data, sha_enrollment_data)
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
