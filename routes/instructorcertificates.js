var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');
var PDFDocument = require('pdfkit');

/* GET instructorcertificates.js page */
// Fetch courses taught by the instructor
router.get('/', function(req, res, next) {
  let userID = req.session.userID; // Assuming the user ID is stored in the session
  let sql = "CALL get_courses_by_instructor(?)";
  dbCon.query(sql, [userID], function(err, result) {
    if (err) {
      throw err;
    } else {
      let courses = result[0];
      res.render('instructorcertificates', { courses: courses, students: [], selectedCourse: null });
    }
  });
});

// Fetch students enrolled in a course
router.get('/students/:courseNumber', function(req, res, next) {
  let courseNumber = req.params.courseNumber;
  let sql = "CALL get_students_by_course(?)";
  dbCon.query(sql, [courseNumber], function(err, result) {
    if (err) {
      throw err;
    } else {
      res.json(result[0]);
    }
  });
});

// Print certificate
router.get('/printCertificate/:studentID/:courseNumber', function(req, res, next) {
  let studentID = req.params.studentID;
  let courseNumber = req.params.courseNumber;

  // Fetch student and course details
  let sql = `
    SELECT CONCAT(a.FirstName, ' ', a.LastName) AS StudentName, c.Subject
    FROM Student s
    JOIN Application a ON s.ApplicationID = a.ApplicationID
    JOIN Enrollment e ON s.StudentID = e.StudentID
    JOIN Course c ON e.CourseNumber = c.CourseNumber
    WHERE s.StudentID = ? AND c.CourseNumber = ?;
  `;
  
  dbCon.query(sql, [studentID, courseNumber], function(err, result) {
    if (err) {
      throw err;
    } else {
      let student = result[0];

      // Create a PDF document
      let doc = new PDFDocument();

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=certificate_${studentID}_${courseNumber}.pdf`);

      // Pipe the PDF document to the response
      doc.pipe(res);

      // Add content to the PDF
      doc.fontSize(20).text('Certificate of Achievement', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`This is to certify that ${student.StudentName} has successfully completed the course ${student.Subject}.`, { align: 'center' });

      // Finalize the PDF and end the stream
      doc.end();
    }
  });
});

/* POST instructorcertificates.js page */
// Update certificate status
router.post('/updateCertificate', function(req, res, next) {
  let enrollmentID = req.body.enrollmentID;
  let certificateAchieved = req.body.certificateAchieved === 'true';

  if (!enrollmentID) {
    return res.status(400).send('Enrollment ID is required');
  }

  let sql = "CALL update_certificate_status(?, ?)";
  dbCon.query(sql, [enrollmentID, certificateAchieved], function(err, result) {
    if (err) {
      throw err;
    } else {
      res.redirect('/instructorcertificates');
    }
  });
});

module.exports = router;