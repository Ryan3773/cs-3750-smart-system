var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');
Assignments = {}

function GetAssignments(req, res) {
  let sql = "CALL get_assignments('" + req.session.courseNumber + "')";

  dbCon.query(sql, function(err,result) {
    if (err) {
      throw err;
    } else {
      console.log("instructorassessments.js: Assignments Queried");
      Assignments.assignments = result;
      RenderIt(res);
    }
  })
}

function RenderIt(res) {
  res.render('instructorassessments', Assignments);
}

/* GET instructorassessments page */
router.get('/', function(req, res, next) {
  GetAssignments(req, res)
  console.log("Course number: " + req.session.courseNumber);
});

/* POST instructorassessments page 
    This handles the logic for when a user
    Edits an assignment
    Deletes an assignment
    Creates and assignment */
router.post('/', function(req, res, next) {
  console.log(req.body.action)
  if (req.body.action == 'edit_assignment') {
    let AssignmentID = req.body.AssignmentID;
    let Description = req.body.Description;
    let PointsPossible = req.body.PointsPossible;
    let AssignmentName = req.body.AssignmentName;
    
    let sql = "CALL edit_assignments(?,?,?,?)";

    dbCon.query(sql, [AssignmentID, AssignmentName, Description, PointsPossible] , function(err, result){
      if (err) {
        throw err;
      } else {
        res.redirect('instructorassessments');
      }
    });
  } else if (req.body.action == 'delete_assignment') {
    let AssignmentID = req.body.AssignmentID;
    let sql = "CALL delete_StudentGrades(?)";

    dbCon.query(sql, [AssignmentID] , function(err, result){
      if (err) {
        throw err;
      } else {
        sql = "CALL delete_assignments(?)";
      }
      dbCon.query(sql, [AssignmentID] , function(err, result){
        if (err) {
          throw err;
        } else {
          res.redirect('instructorassessments');
        }
      });
    });
  }
  else if(req.body.action == 'create_assignment'){
    let Description = req.body.Description;
    let PointsPossible = req.body.PointsPossible;
    let AssignmentName = req.body.AssignmentName;
    
    let sql = "CALL create_assignments(?,?,?,?)";
    dbCon.query(sql, [req.session.courseNumber, AssignmentName, Description, PointsPossible] , function(err, result){
      if (err) {
        throw err;
      } else {
        res.redirect('instructorassessments');
      }
    });
  } else {
    console.log("Unknown post occured");
  }
})

module.exports = router;
