var express = require('express');
var router = express.Router();
const con = require('../lib/database');

/* GET Apply page. */
router.get('/', function(req, res, next) {
  res.render('apply', { });
});

/* POST Apply page. */
router.post('/', function(req, res, next) {
  // Get form data from req.body
  const {
    firstName,
    lastName,
    dateOfBirth,
    address,
    schoolLevel,
    publicSchoolGPA,
    needTransportationAssistance,
    needMealAssistance,
    narrative,
    annualIncome,
    otherContact
  } = req.body;

  // Set default values for checkboxes (if unchecked, they won't be in req.body)
  const transportation = needTransportationAssistance ? 1 : 0;
  const mealAssistance = needMealAssistance ? 1 : 0;

  // Set default application status
  const applicationStatus = 'Pending';

  // Construct SQL query
  const sql = `INSERT INTO Application 
    (FirstName, LastName, DateOfBirth, Address, SchoolLevel, PublicSchoolGPA, NeedTransportationAssistance, NeedMealAssistance, Narrative, AnnualIncome, OtherContact, ApplicationStatus) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    firstName, 
    lastName, 
    dateOfBirth, 
    address, 
    schoolLevel, 
    publicSchoolGPA, 
    transportation, 
    mealAssistance, 
    narrative, 
    annualIncome, 
    otherContact, 
    applicationStatus
  ];

  con.execute(sql, params, function(err, results, fields) {
    if (err) {
      console.error(err);
      // Handle error, maybe render an error page
      res.render('apply', { error: 'Error submitting application. Please try again.' });
    } else {
      // Successfully inserted
      res.render('apply', { message: 'Application submitted successfully!' });
    }
  });
});

module.exports = router;
