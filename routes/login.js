var express = require('express');
var router = express.Router();

var CryptoJS = require('crypto-js');
var SHA256 = CryptoJS.SHA256();

var dbCon = require('../lib/database');

function GetSalt(req, res) {
    const email = req.body.email;
    req.session.email = email;
    let sql = "CALL get_salt('" + email + "')";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }
        if (results[0][0] === undefined) {
            console.log("login: No results found");
            res.render('login', {message: "User '" + email + "' not found"});
        } else {
            const salt = results[0][0].salt;
            req.session.salt = salt;
            CheckUserType(req, res, salt, email);
        }
    });
}

function CheckUserType(req, res, salt, email)
{
    sql = "CALL get_user_type('" + email + "')";
          dbCon.query(sql, function(err, results) {
            if (err) {
                throw err;
            }

            if (results[0][0] === undefined) {
                console.log("login: No results found");
                res.render('login', {message: "User '" + email + "' not found"});
            }

            const userType = results[0][0].UserType;

            link = '';
            if(userType == 'Admin')
            {
              link = 'adminmanage'
            }
            else if(userType == 'Instructor')
            {
              link = 'instructorcourses';
            }
            else if(userType == 'SocialWorker')
            {
              link = 'socialworkernotifications';
            }
            else if(userType == 'Sponsor')
            {
              link = 'sponsorportal';
            }
            else if(userType == 'Owner')
            {
              link = 'ownerportal';
            }
            else
            {
              console.log("UserType isn't one of the choices");
            }

            CheckCredentials(req, res, salt, email, link)
        });
}

function CheckCredentials(req, res, salt, email, link)
{
    const password = req.body.password;
    const hashedPassword = CryptoJS.SHA256(password + ":" + salt).toString(CryptoJS.enc.Hex);
    console.log(hashedPassword);

    let sql = "CALL check_credentials('" + email + "', '" + hashedPassword + "', @result); select @result";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }

        if (results[0][0] === undefined || results[0][0].result == 0) {
            console.log("login.js: No login credentials found");
            res.render('login', {message: "Password not valid for user '" + email + "'.  Please log in again."});
        } else {
            console.log("login.js: Credentials matched");

            req.session.loggedIn = true;
            SaveUserID(req, res, email, link)
        }
    });
}

function SaveUserID(req, res, email, link)
{
  let sql = "CALL get_user_id('" + email + "')";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }
        if (results[0][0] === undefined) {
            console.log("login: No results found");
            res.render('login', {message: "User '" + email + "' not found"});
        } else {
            const userID = results[0][0].UserID;
            req.session.userID = userID;
            req.session.save(function(err) {
              if (err) {
                  throw err;
              }
             
              RedirectIt(res, link);
            });
        }
    });
}

function RedirectIt(res, link)
{
  console.log(link);
  res.redirect(link);
}

/* GET Login page. */
router.get('/', function(req, res, next) {
  res.render('login', { });
});

/* POST Login page. */
router.post('/', function(req, res, next) {
  GetSalt(req, res);
});

module.exports = router;
