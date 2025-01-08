var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

//Object to Store the Query Result
ApplicationStorage = {}

function CollectApplications(req, res) {
  //Collects all Applications with the pending status
  let sql = "CALL get_pending_applications()";
  dbCon.query(sql, function(err, result) {
    if (err) {
        throw err;
    } else {
      console.log("adminapplication.js: Applications Collected");

      //Save Query Result to Object
      ApplicationStorage.applications = result;
      RenderIt(res);
    }
  });
}

function Accept(req, res) {
  //Variables for Creating a Student
  applicationID = req.body.id;
  const status = "Active";
  const photograph = "../public/images/person-circle.jpg";

  // Constructing SQL query
  //CURDATE() Gives the Current Date
  const sql = `INSERT INTO Student 
  (ApplicationID, AdmissionDate, Status, Photograph) 
  VALUES (?, CURDATE(), ?, ?)`;

  const params = [
    applicationID, 
    status, 
    photograph
  ];

  dbCon.execute(sql, params, function(err, results, fields) {
    if (err) {
      throw err;
    } else {
      // Successfully Inserted
      ChangeStatus(res, applicationID, "Accepted");
    }
  });
}

function Decline(req, res) {
  applicationID = req.body.id;

  ChangeStatus(res, applicationID, "Declined");
}

function ChangeStatus(res, applicationID, newApplicationStatus) {
  //Sets the Status of the Application from Pending to Accepted or Declined
  let sql = "CALL set_application_status('" + applicationID + "', '" + newApplicationStatus + "')";
  dbCon.query(sql, function(err, result) {
    if (err) {
      throw err;
    } else {
      console.log("adminapplication.js: Status Set");
      RedirectIt(res);
    }
  });
}

function RenderIt(res) {
  //Use Object when rendering dynamically
  res.render('adminapplication', ApplicationStorage);
}

function RedirectIt(res) {
  //Use Object when rendering dynamically
  res.redirect('adminapplication');
}

/* GET adminapplication page. */
router.get('/', function(req, res, next) {
  console.log("adminapplication.js: GET");
  CollectApplications(req, res);
});

/* POST adminapplication page. */
router.post('/', function(req, res, next) {
  console.log("adminapplication.js: POST");

  //Checks Action from Paylaod and sends to a sequence of Funcions
  if(req.body.action == "Accept") {
    Accept(req, res);
  } else if(req.body.action == "Decline") {
    Decline(req, res);
  } else {
    console.log("Error: Not Accepting or Declining")
  }
});

module.exports = router;
