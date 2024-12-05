let mysql = require('mysql2');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
  host: dbConnectionInfo.host,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  port: dbConnectionInfo.port,
  multipleStatements: true // Needed for stored proecures with OUT results
});

con.connect(function(err) {
  if (err) {
    throw err;
  }
  else {
    console.log("database.js: Connected to server!");
    
    con.query("CREATE DATABASE IF NOT EXISTS cs_3750_smart_system", function (err, result) {
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: cs_3750_smart_system database created if it didn't exist");
      selectDatabase();
    });
  }
});

function selectDatabase() {
    let sql = "USE cs_3750_smart_system";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: Selected cs_3750_smart_system database");
        createTables();
        CreateStoredProcedures();
        //AddTableData();
      }
    });
}

function createTables(){
  let sql = "CREATE TABLE IF NOT EXISTS Application (\n"+
  "ApplicationID INT NOT NULL AUTO_INCREMENT,\n"+
  "FirstName VARCHAR(255) NOT NULL,\n"+
  "LastName VARCHAR(255) NOT NULL,\n"+
  "DateOfBirth DATE NOT NULL,\n"+
  "Address VARCHAR(255) NOT NULL,\n"+
  "SchoolLevel VARCHAR(255) NOT NULL,\n"+
  "PublicSchoolGPA DECIMAL NOT NULL,\n"+
  "NeedTransportationAssistance BOOL NOT NULL,\n"+
  "NeedMealAssistance BOOL NOT NULL,\n"+
  "Narrative TEXT NOT NULL,\n"+
  "AnnualIncome DECIMAL NOT NULL,\n"+
  "OtherContact VARCHAR(255) NOT NULL,\n"+
  "ApplicationStatus VARCHAR(10),\n"+
  "PRIMARY KEY (ApplicationID)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Application table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS Student (\n"+
  "StudentID INT NOT NULL AUTO_INCREMENT,\n"+
  "ApplicationID INT NOT NULL,\n"+
  "AdmissionDate DATE NOT NULL,\n"+
  "Status VARCHAR(10) NOT NULL,\n"+
  "Photograph VARCHAR(255) NOT NULL,\n"+
  "PRIMARY KEY (StudentID),\n"+
  "FOREIGN KEY (ApplicationID) REFERENCES Application(ApplicationID)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Student table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS MealAttendance (\n"+
  "StudentID INT NOT NULL,\n"+
  "Date DATE NOT NULL,\n"+
  "HadBreakfast BOOL,\n"+
  "HadLunch BOOL,\n"+
  "PRIMARY KEY (StudentID, Date)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: MealAttendance table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS User (\n"+
  "UserID INT NOT NULL AUTO_INCREMENT,\n"+
  "FirstName VARCHAR(255) NOT NULL,\n"+
  "LastName VARCHAR(255) NOT NULL,\n"+
  "Email VARCHAR(255) NOT NULL,\n"+
  "Password VARCHAR(255) NOT NULL,\n"+
  "Salt VARCHAR(255) NOT NULL,\n" +
  "UserType VARCHAR(255) NOT NULL,\n"+
  "PRIMARY KEY (UserID)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: User table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS Sponsor (\n"+
  "SponsorID INT NOT NULL AUTO_INCREMENT,\n"+
  "UserID INT NOT NULL,\n"+
  "Organization VARCHAR(255),\n"+
  "Contact VARCHAR(255),\n"+
  "PRIMARY KEY (SponsorID),\n"+
  "FOREIGN KEY (UserID) REFERENCES User(UserID)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Sponsor table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS StudentSponsors (\n"+
  "StudentID INT NOT NULL,\n"+
  "SponsorID INT NOT NULL,\n"+
  "PRIMARY KEY (StudentID, SponsorID)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Sponsor table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS Term (\n"+
  "TermID INT NOT NULL AUTO_INCREMENT,\n"+
  "TermName NVARCHAR(255) NOT NULL,\n"+
  "StartDate DATE NOT NULL,\n"+
  "EndDate DATE NOT NULL,\n"+
  "PRIMARY KEY (TermID)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js:Term table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS Course (\n"+
  "CourseNumber INT NOT NULL AUTO_INCREMENT,\n"+
  "TermID INT NOT NULL,\n"+
  "UserID INT NOT NULL,\n"+
  "Subject VARCHAR(255),\n"+
  "PRIMARY KEY(CourseNumber),\n"+
  "FOREIGN KEY (TermID) REFERENCES Term(TermID),\n"+
  "FOREIGN KEY (UserID) REFERENCES User(UserID)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Course table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS Assignments (\n"+
  "AssignmentID INT NOT NULL AUTO_INCREMENT,\n"+
  "CourseNumber INT NOT NULL,\n"+
  "AssignmentName VARCHAR(255) NOT NULL,\n"+
  "Description TEXT,\n"+
  "PointsPossible DECIMAL NOT NULL,\n"+
  "PRIMARY KEY (AssignmentID),\n"+
  "FOREIGN KEY (CourseNumber) REFERENCES Course(CourseNumber)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Assignments table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS StudentGrades (\n"+
  "AssignmentID INT NOT NULL,\n"+
  "StudentID INT NOT NULL,\n"+
  "Grade DECIMAL,\n"+
  "PRIMARY KEY (AssignmentID, StudentID)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: StudentGrades table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS CourseTIme (\n"+
  "CourseTimeID INT NOT NULL AUTO_INCREMENT,\n"+
  "CourseNumber INT NOT NULL,\n"+
  "DayOfWeek VARCHAR(10),\n"+
  "StartTime TIME,\n"+
  "EndTime TIME,\n"+
  "PRIMARY KEY (CourseTimeID),\n"+
  "FOREIGN KEY (CourseNumber) REFERENCES Course(CourseNumber)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: CourseTime table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS Enrollment (\n"+
  "EnrollmentID INT NOT NULL AUTO_INCREMENT,\n"+
  "StudentID INT NOT NULL,\n"+
  "CourseNumber INT NOT NULL,\n"+
  "Status VARCHAR(10),\n"+
  "CertificateAchieved BOOL,\n"+
  "PRIMARY KEY (EnrollmentID),\n"+
  "FOREIGN KEY (StudentID) REFERENCES Student(StudentID),\n"+
  "FOREIGN KEY (CourseNumber) REFERENCES Course(CourseNumber)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Enrollment table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS Attendance (\n"+
  "AttendanceID INT NOT NULL AUTO_INCREMENT,\n"+
  "EnrollmentID INT NOT NULL,\n"+
  "Date DATE NOT NULL,\n"+
  "Status VARCHAR(10),\n"+
  "PRIMARY KEY (AttendanceID),\n"+
  "FOREIGN KEY (EnrollmentID) REFERENCES Enrollment (EnrollmentID)\n"+
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Attendance table created if it didn't exist");
    }
  });


}

function CreateStoredProcedures()
{
  sql = "CREATE PROCEDURE IF NOT EXISTS `get_pending_applications`(\n" +
            ")\n" +
            "BEGIN\n" +
              "SELECT * FROM application\n" +
              "WHERE ApplicationStatus = 'Pending';\n" +
            "END;";
  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_pending_applications created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `set_application_status`(\n" +
              "IN id INT,\n" +
              "IN newApplicationStatus VARCHAR(10)\n" +
            ")\n" +
            "BEGIN\n" +
              "UPDATE Application\n" +
              "SET ApplicationStatus = newApplicationStatus\n" +
              "WHERE ApplicationID = id;\n" +
            "END;";
  con.query(sql, function(err, results, fields) {
    if (err) 
    {
      console.log(err.message);
      throw err;
    } 
    else 
    {
      console.log("database.js: procedure set_application_status created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `check_credentials`(\n" +
            "IN Email VARCHAR(255),\n" +
            "IN Password VARCHAR(255),\n" +
            "OUT result INT\n" +
          ")\n" +
          "BEGIN\n" +
          "SELECT EXISTS(\n" +
            "SELECT * FROM User\n" +
            "WHERE User.Email = Email AND User.Password = Password\n" +
          ") AS result;\n" +
          "END;";
  con.query(sql, function(err, results, fields) {
    if (err) 
    {
      console.log(err.message);
      throw err;
    } 
    else 
    {
      console.log("database.js: procedure check_credentials created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_salt`(\n" +
            "IN Email VARCHAR(255)\n" +
          ")\n" +
          "BEGIN\n" +
            "SELECT Salt FROM User\n" +
            "WHERE User.Email = Email\n" +
            "LIMIT 1;\n" +
          "END;";
  con.query(sql, function(err, results, fields) {
    if (err) 
    {
      console.log(err.message);
      throw err;
    } 
    else 
    {
      console.log("database.js: procedure get_salt created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_id`(\n" +
            "IN Email VARCHAR(255) \n" +
        ")\n" +
        "BEGIN\n" +
          "SELECT UserID FROM User \n" +
          "WHERE User.Email = Email;\n" +
        "END;"
  con.query(sql, function(err, results, fields) {
    if (err) 
    {
      console.log(err.message);
      throw err;
    } 
    else 
    {
      console.log("database.js: procedure get_user_id created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_type`(\n" +
            "IN Email VARCHAR(255) \n" +
        ")\n" +
        "BEGIN\n" +
          "SELECT UserType FROM User \n" +
          "WHERE User.Email = Email;\n" +
        "END;"
  con.query(sql, function(err, results, fields) {
    if (err) 
    {
      console.log(err.message);
      throw err;
    } 
    else 
    {
      console.log("database.js: procedure get_user_type created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_term_id`(\n" +
            "IN TermName VARCHAR(255) \n" +
        ")\n" +
        "BEGIN\n" +
          "SELECT TermID FROM Term \n" +
          "WHERE Term.TermName = TermName;\n" +
        "END;"
  con.query(sql, function(err, results, fields) {
    if (err) 
    {
      console.log(err.message);
      throw err;
    } 
    else 
    {
      console.log("database.js: procedure get_term_id created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_courses`(\n" +
            "IN UserID INT \n" +
        ")\n" +
        "BEGIN\n" +
          "SELECT * FROM Course \n" +
          "WHERE Course.UserID = UserID;\n" +
        "END;"
  con.query(sql, function(err, results, fields) {
    if (err) 
    {
      console.log(err.message);
      throw err;
    } 
    else 
    {
      console.log("database.js: procedure get_courses created if it didn't exist");
    }
  });

}

function AddTableData()
{
  let sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('God', 'Father', 'God@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'Admin')`;
  con.execute(sql, function(err, results, fields) {
    if (err) 
    {
      throw err;
    } 
    else 
    {
      console.log("database.js: Admin Table Data inserted");
    }
  });

  sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('Brad', 'Peterson', 'BradPeterson@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'Instructor')`;
  con.execute(sql, function(err, results, fields) {
    if (err) 
    {
      throw err;
    } 
    else 
    {
      console.log("database.js: Instructor Table Data inserted");
    }
  });

  sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('Isaac', 'Turk', 'IsaacTurk@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'SocialWorker')`;
  con.execute(sql, function(err, results, fields) {
    if (err) 
    {
      throw err;
    } 
    else 
    {
      console.log("database.js: SocialWorker Table Data inserted");
    }
  });

  sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('Bill', 'Gates', 'BillGates@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'Sponsor')`;
  con.execute(sql, function(err, results, fields) {
    if (err) 
    {
      throw err;
    } 
    else 
    {
      console.log("database.js: Sponsor Table Data inserted");
    }
  });

  sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('Boss', 'Man', 'BossMan@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'Owner')`;
  con.execute(sql, function(err, results, fields) {
    if (err) 
    {
      throw err;
    } 
    else 
    {
      console.log("database.js: Owner Table Data inserted");
    }
  });

  sql = `INSERT INTO Term (TermName, StartDate, EndDate) 
    VALUES ('Fall 2024', '2024-08-25', '2024-12-25')`;
  con.execute(sql, function(err, results, fields) {
    if (err) 
    {
      throw err;
    } 
    else 
    {
      console.log("database.js: Term Data Fall 2024 Inserted");
    }
  });

  sql = `INSERT INTO Term (TermName, StartDate, EndDate) 
  VALUES ('Spring 2025', '2025-01-02', '2025-04-29')`;
con.execute(sql, function(err, results, fields) {
  if (err) 
  {
    throw err;
  } 
  else 
  {
    console.log("database.js: Term Data Spring 2025 Inserted");
  }
});

sql = `INSERT INTO Term (TermName, StartDate, EndDate) 
VALUES ('Fall 2025', '2025-08-25', '2025-12-25')`;
con.execute(sql, function(err, results, fields) {
if (err) 
{
  throw err;
} 
else 
{
  console.log("database.js: Term Data Fall 2024 Inserted");
}
});

sql = `INSERT INTO Term (TermName, StartDate, EndDate) 
VALUES ('Spring 2025', '2025-01-02', '2025-04-29')`;
con.execute(sql, function(err, results, fields) {
if (err) 
{
  throw err;
} 
else 
{
  console.log("database.js: Term Data Fall 2024 Inserted");
}
});
}

module.exports = con;