var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

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

function RedirectIt(res)
{
  res.redirect("adminmanage");
}

module.exports = router;
