var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

function GetStudentData(req, res){

  let sql = "CALL get_students_for_sponsors('" + req.session.userID + "')";
  dbCon.query(sql, function(err,result) {
    if (err) throw err;
    console.log("sponsorportal.js: students Queried")
    data = result[0]
    RenderOwnerPortal(res, data)
  })
}

function RenderOwnerPortal(res, data){
  const processedData = data.map(student => {
    // Handle null or empty CourseDetails
    const courses = student.CourseDetails
        ? student.CourseDetails.split(':').map(courseDetail => {
            courseDetail = courseDetail.trim();

            const splitDetail = courseDetail.split(',');
            const courseName = splitDetail[0]?.trim()
            const certificate = splitDetail[1]?.trim()

            return { name: courseName, certificate: certificate };
        })
        : []; // Default to an empty array

    return {
        studentid: student.studentid,
        name: student.Name,
        admissionDate: new Date(student.AdmissionDate).toLocaleDateString(),
        dateOfBirth: new Date(student.DateOfBirth).toLocaleDateString(),
        courses: courses
    };
});
res.render('sponsorportal', { students: processedData });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  GetStudentData(req,res)
});

module.exports = router;

