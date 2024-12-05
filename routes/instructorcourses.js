var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

CourseStorage = {}

function GetCourses(req, res)
{
  let sql = "CALL get_courses('" + req.session.userID + "')";
  dbCon.query(sql, function(err, result) {
    if (err) 
    {
        throw err;
    }
    else
    {
      console.log("instructorcourses.js: Courses Collected");

      //Save Query Result to Object
      CourseStorage.courses = result;
      RenderPage(res);
    }
  });
}

function RenderPage(res)
{
  res.render('instructorcourses', CourseStorage);
}

/* GET Course page. */
router.get('/', function(req, res, next) {
  GetCourses(req, res);
});

function GetTermID(req, res)
{
  let sql = "CALL get_term_id('" + req.body.term + "')";
  dbCon.query(sql, function(err, result) {
    if (err) 
    {
        throw err;
    }
    else
    {
      console.log("instructorcourses.js: Courses Collected");

      //Save Query Result to Object
      termID = result[0][0].TermID;
      CreateCourse(req, res, termID);
    }
  });
}

function CreateCourse(req, res, termID)
{
    // Construct SQL query
  const sql = `INSERT INTO Course 
    (TermID, UserID, Subject) 
    VALUES (?, ?, ?)`;

  const params = [
    termID, 
    req.session.userID, 
    req.body.subject
  ];

  dbCon.execute(sql, params, function(err, results, fields) {
    if (err) 
    {
      throw err;
    } 
    else 
    {
      // Successfully inserted
      res.redirect('instructorcourses');
    }
  });
}

/* POST Course page. */
router.post('/', function(req, res, next) {
  if(req.body.action == 'Create_Course')
  {
    GetTermID(req, res);
  }
  else if(req.body.action == 'Add_Lecture_Time')
  {
  // Construct SQL query
  const sql = `INSERT INTO CourseTime 
    (CourseNumber, DayOfWeek, StartTime, EndTime) 
    VALUES (?, ?, ?, ?)`;

  const params = [
    req.body.courseNumber, 
    req.body.dayofWeek, 
    req.body.startTime,
    req.body.endTime
  ];

  dbCon.execute(sql, params, function(err, results, fields) {
    if (err) 
    {
      throw err;
    } 
    else 
    {
      // Successfully inserted
      res.redirect('instructorcourses');
    }
  });
  }
  else if(req.body.action == 'Enter_Course')
  {
    req.session.courseNumber = req.body.CourseNumber;
    req.session.save(function(err) {
      if (err) {
          throw err;
      }
     
      res.redirect('instructorassessments');
    });
  }
  else
  {
    console.log("NO Action Selected");
  }
});

module.exports = router;
