var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');
gradebookData = {}
groupedData = {}
courseAssignments = [];

function getGradebookData(req,res){
    gradebookData = {}
    groupedData = {}
    courseAssignments = [];
    let sql = "CALL get_course_gradebook('" + req.session.courseNumber + "')";
    console.log("Current Course: " + req.session.courseNumber)
    dbCon.query(sql, function(err,result) {
      if (err) throw err;
      console.log("instructorgradebook.js: Gradebook Queried")
      gradebookData = result[0];

      gradebookData.forEach(row => {
        const {StudentName, EnrollmentID, AssignmentID, AssignmentName, Grade } = row;

        if (!EnrollmentID) {
          console.error("Missing EnrollmentID for row:", row);
          return; // Skip rows with missing EnrollmentID
        }

        if(!groupedData[EnrollmentID]){
          groupedData[EnrollmentID] = {
            StudentName,
            EnrollmentID,
            Grades: {},
          };
        }

        groupedData[EnrollmentID].Grades[AssignmentID] = Grade;
        if(!courseAssignments.some(assignment => assignment.AssignmentID === AssignmentID)){
          courseAssignments.push({
            AssignmentID,
            AssignmentName,
          });
        }

        Object.values(groupedData).forEach(student => {
          courseAssignments.forEach(({ AssignmentID }) => {
              if (!student.Grades[AssignmentID]) {
                  student.Grades[AssignmentID] = '-';
              }
          });
      });

      });
      RenderGradebook(res);
    })
}

function RenderGradebook(res){
    res.render('instructorgradebook', {
      students: groupedData,
      assignments: courseAssignments,
    });
}

/* GET instructorgradebook */
router.get('/', function(req, res, next) {
  getGradebookData(req, res)
});

router.post('/', (req, res) => {
  const grades = req.body.grades; 
  const sql = `
      INSERT INTO StudentGrades (EnrollmentID, AssignmentID, Grade)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE Grade = VALUES(Grade)
  `;

  // Process grades
  Object.keys(grades).forEach(enrollmentID => {
      const assignments = grades[enrollmentID];

      Object.keys(assignments).forEach(assignmentID => {
          const { EnrollmentID, AssignmentID, Grade } = assignments[assignmentID];

          // Skip if grade is empty
          if (Grade === '' || Grade === null || Grade === undefined) return;

          dbCon.query(sql, [EnrollmentID, AssignmentID, Grade], (err, result) => {
              if (err) {
                  console.error("Error updating grade:", err);
              }
          });
      });
  });
  res.redirect('instructorgradebook')
});

module.exports = router;