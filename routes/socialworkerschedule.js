var express = require('express');
var router = express.Router();
var dbCon = require('../lib/database');

// Fetch active students and their available times
router.get('/', function(req, res, next) {
  let sql = "CALL get_active_students_with_times()";
  dbCon.query(sql, function(err, result) {
    if (err) {
      throw err;
    } else {
      let students = result[0];
      let sqlCourses = "CALL get_all_courses_with_instructors()"; // Assuming you have a stored procedure for this
      dbCon.query(sqlCourses, function(err, resultCourses) {
        if (err) {
          throw err;
        } else {
          let courses = resultCourses[0];
          res.render('socialworkerschedule', { students: students, courses: courses });
        }
      });
    }
  });
});

// Handle enrollment
router.post('/enroll', function(req, res, next) {
  let studentID = req.body.studentID;
  let courseNumber = req.body.courseNumber;

  let sql = "CALL enroll_student(?, ?)";
  dbCon.query(sql, [studentID, courseNumber], function(err, result) {
    if (err) {
      throw err;
    } else {
      res.redirect('/socialworkerschedule');
    }
  });
});

// Handle updating or inserting availability
router.post('/updateAvailability', function(req, res, next) {
  let availabilityID = req.body.availabilityID;
  let studentID = req.body.studentID;
  let dayOfWeek = req.body.dayOfWeek;
  let startTime = req.body.startTime;
  let endTime = req.body.endTime;

  let sql;
  let params;

  if (availabilityID) {
    sql = "CALL update_student_availability(?, ?, ?, ?, ?)";
    params = [availabilityID, studentID, dayOfWeek, startTime, endTime];
  } else {
    sql = "CALL insert_student_availability(?, ?, ?, ?)";
    params = [studentID, dayOfWeek, startTime, endTime];
  }

  dbCon.query(sql, params, function(err, result) {
    if (err) {
      throw err;
    } else {
      res.redirect('/socialworkerschedule');
    }
  });
});

// Handle deleting availability
router.post('/deleteAvailability', function(req, res, next) {
  let availabilityID = req.body.availabilityID;
  let studentID = req.body.studentID;

  let sql = "CALL delete_student_availability(?, ?)";
  dbCon.query(sql, [availabilityID, studentID], function(err, result) {
    if (err) {
      throw err;
    } else {
      res.redirect('/socialworkerschedule');
    }
  });
});

module.exports = router;