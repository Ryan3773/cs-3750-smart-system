var express = require('express');
var router = express.Router();
var con = require('../lib/database');
const util = require('util');

// Promisify query
const query = util.promisify(con.query).bind(con);

/* GET attendance page. */
router.get('/', async function(req, res, next) {
  try {
    // Ensure user and courseNumber checks if needed:
    // if (!req.session.userID || req.session.userType !== 'Instructor') return res.redirect('/login');
    // if (!req.session.courseNumber) return res.redirect('/instructorcourses');

    //Get main attendance info
    let result = await query("CALL get_attendance_students(?)", [req.session.courseNumber]);
    // result[0] contains the rows
    let studentsData = result[0];

    //For each student (enrollment), get all attendance records
    let allAttendance = {};
    for (let studentRow of studentsData) {
      let enrollmentID = studentRow.EnrollmentID;
      let allRecordsResult = await query("CALL get_all_attendance_for_enrollment(?)", [enrollmentID]);
      let allRecords = allRecordsResult[0]; // the first result set
      allAttendance[enrollmentID] = allRecords;
    }

    //Render page
    res.render('instructorattendence', {
      students: result,
      allAttendance: allAttendance
    });
  } catch (err) {
    console.error("Error in GET /instructorattendence:", err);
    res.render('instructorattendence', { students: [[]], allAttendance: {}, error: 'Error loading attendance data' });
  }
});

/* POST handling for attendance actions */
router.post('/record', async function(req, res, next) {
  try {
    let action = req.body.action;
    if (action === 'mark_attendance') {
      let enrollmentID = req.body.enrollmentID;
      let attendanceStatus = req.body.attendanceStatus;
      await query("CALL mark_attendance(?, ?)", [enrollmentID, attendanceStatus]);
      console.log("Attendance marked for enrollmentID =", enrollmentID);
      return res.redirect('/instructorattendence');

    } else if (action === 'update_attendance') {
      let attendanceID = req.body.attendanceID;
      let attendanceStatus = req.body.attendanceStatus;
      await query("CALL update_attendance(?, ?)", [attendanceID, attendanceStatus]);
      console.log("Attendance updated for attendanceID =", attendanceID);
      return res.redirect('/instructorattendence');

    } else if (action === 'remove_attendance') {
      let enrollmentID = req.body.enrollmentID;
      await query("CALL remove_attendance(?)", [enrollmentID]);
      console.log("Attendance removed for enrollmentID =", enrollmentID);
      return res.redirect('/instructorattendence');

    } else if (action === 'update_full_attendance') {
      // Updates date and status for a given attendanceID
      let attendanceID = req.body.attendanceID;
      let attendanceStatus = req.body.attendanceStatus;
      let date = req.body.date;
      await query("CALL update_full_attendance(?, ?, ?)", [attendanceID, attendanceStatus, date]);
      console.log("Full attendance updated for attendanceID =", attendanceID);
      return res.redirect('/instructorattendence');

    } else if (action === 'remove_attendance_by_id') {
      let attendanceID = req.body.attendanceID;
      await query("CALL remove_attendance_by_id(?)", [attendanceID]);
      console.log("Attendance record removed by ID =", attendanceID);
      return res.redirect('/instructorattendence');

    } else {
      console.log("Unknown POST action on instructorattendence:", action);
      return res.redirect('/instructorattendence');
    }
  } catch (err) {
    console.error("Error in POST /instructorattendence/record:", err);
    res.redirect('/instructorattendence?error=Database+error');
  }
});

module.exports = router;
