var express = require('express');
var router = express.Router();
var dbCon = require('../lib/database');

// Fetch absent attendance records
router.get('/', function(req, res, next) {
  let sql = "CALL get_absent_attendance()";
  dbCon.query(sql, function(err, result) {
    if (err) {
      throw err;
    } else {
      let absences = result[0];
      res.render('socialworkernotifications', { absences: absences });
    }
  });
});

// Handle updating attendance status
router.post('/updateAttendance', function(req, res, next) {
  let attendanceID = req.body.attendanceID;
  let newStatus = req.body.newStatus; // 'Excused' or 'Inexcused'

  let sql = "CALL update_attendance_status(?, ?)";
  dbCon.query(sql, [attendanceID, newStatus], function(err, result) {
    if (err) {
      throw err;
    } else {
      res.redirect('/socialworkernotifications');
    }
  });
});

module.exports = router;