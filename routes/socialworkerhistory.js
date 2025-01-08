var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');
var multer = require('multer');
var path = require('path');

// Set up multer for file upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage });

/* GET socialworkerhistory page */
// Fetch all students with details
router.get('/', function(req, res, next) {
  let sql = "CALL get_all_students_with_details()";

  dbCon.query(sql, function(err, result) {
    if (err) {
      throw err;
    } else {
      let students = result[0];
      res.render('socialworkerhistory', { students: students });
    }
  });
});

// Fetch notes for a student
router.get('/notes/:studentID', function(req, res, next) {
  let studentID = req.params.studentID;
  let sql = "CALL get_student_notes(?)";

  dbCon.query(sql, [studentID], function(err, result) {
    if (err) {
      throw err;
    } else {
      res.json(result[0]);
    }
  });
});

// Insert a new note
router.post('/notes', function(req, res, next) {
  let studentID = req.body.studentID;
  let userID = req.session.userID; // Assuming the user ID is stored in the session
  let note = req.body.note;

  let sql = "CALL insert_student_note(?, ?, ?)";

  dbCon.query(sql, [studentID, userID, note], function(err, result) {
    if (err) {
      throw err;
    } else {
      res.redirect('/socialworkerhistory');
    }
  });
});

// Update a note
router.post('/notes/update', function(req, res, next) {
  let studentNoteID = req.body.studentNoteID;
  let note = req.body.note;

  let sql = "CALL update_student_note(?, ?)";

  dbCon.query(sql, [studentNoteID, note], function(err, result) {
    if (err) {
      throw err;
    } else {
      res.redirect('/socialworkerhistory');
    }
  });
});

// Delete a note
router.post('/notes/delete', function(req, res, next) {
  let studentNoteID = req.body.studentNoteID;

  let sql = "CALL delete_student_note(?)";

  dbCon.query(sql, [studentNoteID], function(err, result) {
    if (err) {
      throw err;
    } else {
      res.redirect('/socialworkerhistory');
    }
  });
});

// Update student photo
router.post('/updatePhoto', upload.single('photo'), function(req, res, next) {
  let studentID = req.body.studentID;
  let photoPath = '../public/images/' + req.file.filename;

  let sql = "UPDATE Student SET Photograph = ? WHERE StudentID = ?";
  
  dbCon.query(sql, [photoPath, studentID], function(err, result) {
    if (err) {
      throw err;
    } else {
      res.redirect('/socialworkerhistory');
    }
  });
});

module.exports = router;