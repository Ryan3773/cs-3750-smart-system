var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

var CryptoJS = require('crypto-js');
var SHA256 = CryptoJS.SHA256();

ManagerStorage = {}

/* GET home page. */
router.get('/', function(req, res, next) {
  GetUsers(req, res);
});

function GetUsers(req, res)
{
  let sql = "SELECT * FROM User;";
  dbCon.query(sql, function(err, result) {
      if (err) 
      {
        throw err;
      } 
      else 
      {
        ManagerStorage.users = result;
        GetStudents(req, res);
      }

    });
}

function GetStudents(req, res)
{
  let sql = "SELECT * \
            FROM Student \
            INNER JOIN Application ON Student.ApplicationID = Application.ApplicationID;";
  dbCon.query(sql, function(err, result) {
      if (err) 
      {
        throw err;
      } 
      else 
      {
        ManagerStorage.students = result;
        CheckForGodsPresence(req, res);
      }

    });
}

function CheckForGodsPresence(req, res)
{
  let god = false;
  if(req.session.userID == 1)
  {
    god = true;
  }
  ManagerStorage.god = god;
  RenderIt(res);
}

function RenderIt(res)
{
  res.render('adminmanage', ManagerStorage);
}

/* Post home page. */
router.post('/', function(req, res, next) {
  if(req.body.action == "RemoveUser")
  {
    RemoveUser(req, res);
  }
  else if (req.body.action == "ChangeUserType")
  {
    ChangeUserType(req, res);
  }
  else if (req.body.action == "CreateUser")
  {
    CreateUser(req, res);
  }
  else if (req.body.action == "SetStatus")
  {
    SetStatus(req, res);
  }
  else
  {
    console.log("Error: Action not specified");
  }
});

function RemoveUser(req, res)
{
  if(req.body.id != 1)
  {
    let sql = "DELETE FROM User WHERE UserID = " + req.body.id + ";";
    dbCon.execute(sql, function(err, result) {
      if (err) 
      {
        throw err;
      } 
      else 
      {
        RedirectIt(res);
      }
    });
  }
  else
  {
    console.log("Can't touch God");
  }
}

function ChangeUserType(req, res)
{
  if(req.body.id != 1)
    {
      let sql = "UPDATE User SET UserType = '" + req.body.NewUserType + "' WHERE UserID = " + req.body.id + ";";
      dbCon.execute(sql, function(err, result) {
        if (err) 
        {
          throw err;
        } 
        else 
        {
          RedirectIt(res);
        }
      });
    }
    else
    {
      console.log("Can't touch God");
    }
}

function SetStatus(req, res)
{
  let sql = "UPDATE Student SET Status = '" + req.body.status + "' WHERE StudentID = " + req.body.id + ";";
  dbCon.execute(sql, function(err, result) {
    if (err) 
    {
      throw err;
    } 
    else 
    {
      RedirectIt(res);
    }
  });
}

function CreateUser(req, res)
{
  let salt = CryptoJS.lib.WordArray.random(8);
  const hashedPassword = CryptoJS.SHA256(req.body.password + ":" + salt).toString(CryptoJS.enc.Hex);
  const sql = `INSERT INTO User 
    (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES (?, ?, ?, ?, ?, ?)`;

  const params = [
    req.body.firstName, 
    req.body.lastName, 
    req.body.email, 
    hashedPassword, 
    salt, 
    req.body.userType
  ];

  dbCon.execute(sql, params, function(err, results, fields) {
    if (err) {
      throw err;
    } else {
      RedirectIt(res);
    }
  });
}

function RedirectIt(res)
{
  res.redirect("adminmanage");
}

module.exports = router;
