let mysql = require('mysql2');

var dbConnectionInfo = require('./connectioninfo');

//Connects to Database using connectionInfo.js
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
    
    //Creates Database cs_3750_smart_system
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
        AddTableData();
      }
    });
}

// All Tables are documented in ../docs/ERD/SMART.jpg
function createTables() {
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
            ");";

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
        ");";

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
        ");";

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
        ");";

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
        ");";

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
        ");";

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: StudentSponsors table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS Term (\n"+
          "TermID INT NOT NULL AUTO_INCREMENT,\n"+
          "TermName NVARCHAR(255) NOT NULL,\n"+
          "StartDate DATE NOT NULL,\n"+
          "EndDate DATE NOT NULL,\n"+
          "PRIMARY KEY (TermID)\n"+
        ");";

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Term table created if it didn't exist");
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
        ");";

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
        ");";

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Assignments table created if it didn't exist");
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
        ");";

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
        ");";

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Enrollment table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS StudentGrades (\n"+
          "AssignmentID INT NOT NULL,\n"+
          "EnrollmentID INT NOT NULL,\n"+
          "Grade DECIMAL,\n"+
          "PRIMARY KEY (AssignmentID, EnrollmentID),\n"+
          "FOREIGN KEY (EnrollmentID) REFERENCES Enrollment(EnrollmentID),\n"+
          "FOREIGN KEY (AssignmentID) REFERENCES Assignments(AssignmentID)\n"+
        ");";

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: StudentGrades table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS Attendance (\n"+
          "AttendanceID INT NOT NULL AUTO_INCREMENT,\n"+
          "EnrollmentID INT NOT NULL,\n"+
          "Date DATE NOT NULL,\n"+
          "Status VARCHAR(10),\n"+
          "PRIMARY KEY (AttendanceID),\n"+
          "FOREIGN KEY (EnrollmentID) REFERENCES Enrollment (EnrollmentID)\n"+
        ");";

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Attendance table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS StudentNote (\n"+
          "StudentNoteID INT NOT NULL AUTO_INCREMENT,\n"+
          "UserID INT NOT NULL,\n"+
          "StudentID INT NOT NULL,\n"+
          "Date DATE NOT NULL,\n"+
          "Note TEXT,\n"+
          "PRIMARY KEY (StudentNoteID),\n"+
          "FOREIGN KEY (UserID) REFERENCES User(UserID),\n"+
          "FOREIGN KEY (StudentID) REFERENCES Student(StudentID)\n"+
        ");";

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: StudentNote table created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS StudentAvailability (\n"+
          "AvailabilityID INT NOT NULL AUTO_INCREMENT,\n"+
          "StudentID INT NOT NULL,\n"+
          "DayOfWeek VARCHAR(10),\n"+
          "StartTime TIME,\n"+
          "EndTime TIME,\n"+
          "PRIMARY KEY (AvailabilityID),\n"+
          "FOREIGN KEY (StudentID) REFERENCES Student(StudentID)\n"+
        ");";

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: StudentAvailability table created if it didn't exist");
    }
  });

}

function CreateStoredProcedures()
{
  sql = "CREATE PROCEDURE IF NOT EXISTS `get_pending_applications`()\n" +
            "BEGIN\n" +
              "SELECT * FROM application\n" +
              "WHERE ApplicationStatus = 'Pending';\n" +
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_pending_applications created if it didn't exist");
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
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE set_application_status created if it didn't exist");
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
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE check_credentials created if it didn't exist");
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
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_salt created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_id`(\n" +
              "IN Email VARCHAR(255) \n" +
            ")\n" +
            "BEGIN\n" +
              "SELECT UserID FROM User \n" +
              "WHERE User.Email = Email;\n" +
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_user_id created if it didn't exist");
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
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_user_type created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_term_id`(\n" +
              "IN TermName VARCHAR(255) \n" +
            ")\n" +
            "BEGIN\n" +
              "SELECT TermID FROM Term \n" +
              "WHERE Term.TermName = TermName;\n" +
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_term_id created if it didn't exist");
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
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_courses created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_assignments`(\n"+
              "CourseNumber INT \n"+
            ")\n"+
            "BEGIN \n"+
              "SELECT * FROM Assignments WHERE Assignments.CourseNumber = CourseNumber; \n"+
            "END;";
  
  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_assignments created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `edit_assignments`(\n"+
              "AssignmentID INT, \n"+
              "AssignmentName VARCHAR(255), \n"+
              "Description TEXT, \n"+
              "PointsPossible DECIMAL \n"+
            ") \n"+
            "BEGIN \n" +
              "UPDATE assignments \n"+
              "SET Assignments.AssignmentName = AssignmentName, Assignments.Description = Description, Assignments.PointsPossible = PointsPossible \n"+
              "WHERE Assignments.AssignmentID = AssignmentID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE edit_assignments created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `create_assignments`(\n"+
              "CourseNumber INT, \n" +
              "AssignmentName VARCHAR(255), \n"+
              "Description TEXT, \n"+
              "PointsPossible DECIMAL \n"+
            ") \n"+
            "BEGIN \n" +
              "INSERT INTO assignments(CourseNumber, AssignmentName, Description, PointsPossible) \n"+
              "VALUES(CourseNumber, AssignmentName, Description, PointsPossible); \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE create_assignments created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `delete_assignments`(\n"+
              "AssignmentID INT \n" +
            ") \n"+
            "BEGIN \n" +
              "DELETE FROM assignments \n"+
              "WHERE assignments.assignmentID = AssignmentID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE delete_assignments created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `delete_StudentGrades`(\n"+
              "AssignmentID INT \n" +
            ") \n"+
            "BEGIN \n" +
              "DELETE FROM StudentGrades \n"+
              "WHERE StudentGrades.AssignmentID = AssignmentID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE delete_StudentGrades created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_course_gradebook` (\n"+
              "CourseNumber INT\n"+
            ") \n"+
            "BEGIN \n"+
              "SELECT CONCAT(app.FirstName, ' ', app.LastName) AS StudentName,  e.EnrollmentID, a.AssignmentID, a.AssignmentName, \n"+
                      "COALESCE(sg.Grade, '-') AS Grade, a.PointsPossible \n"+
              "FROM enrollment e \n"+
              "JOIN Student s \n"+
                "ON e.StudentID = s.StudentID \n"+
              "JOIN Application app \n"+
                "ON s.ApplicationID = app.ApplicationID \n"+
              "JOIN Assignments a \n"+
                "ON a.CourseNumber = e.CourseNumber \n"+
              "LEFT JOIN StudentGrades sg \n"+
                "ON sg.EnrollmentID = e.EnrollmentID AND sg.AssignmentID = a.AssignmentID \n"+
              "WHERE e.CourseNumber = courseNumber \n"+
              "ORDER BY app.LastName, app.FirstName, a.AssignmentName;\n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_course_gradebook created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_attendance_students` ( \n"+
              "IN CourseNum INT \n"+
            ") \n"+
            "BEGIN \n"+
              "SELECT s.StudentID, a.FirstName, a.LastName, s.Photograph, e.EnrollmentID, c.CourseNumber, c.Subject, \n"+
                      "att.AttendanceID AS TodayAttendanceID, att.Status AS TodayAttendanceStatus \n"+
              "FROM Student s \n"+
              "JOIN Application a \n"+
                "ON a.ApplicationID = s.ApplicationID \n"+
              "JOIN Enrollment e \n"+
                "ON e.StudentID = s.StudentID \n"+
              "JOIN Course c \n"+
                "ON c.CourseNumber = e.CourseNumber \n"+
              "LEFT JOIN Attendance att \n"+
                "ON att.EnrollmentID = e.EnrollmentID AND att.Date = CURDATE() \n"+
              "WHERE c.CourseNumber = CourseNum \n"+
                "AND e.Status = 'Active'; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_attendance_students created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_students_for_owners` () \n"+
            "BEGIN \n"+
              "SELECT s.studentid, CONCAT(a.FirstName, ' ', a.LastName) AS Name, s.AdmissionDate, a.DateOfBirth, \n"+
                      "GROUP_CONCAT(CONCAT(c.Subject, ',', e.CertificateAchieved) SEPARATOR ': ') AS CourseDetails \n"+
              "FROM Student s \n"+
              "LEFT JOIN application a  \n"+
                "ON s.applicationid = a.ApplicationID \n"+
              "LEFT JOIN enrollment e  \n"+
                "ON e.studentid = s.studentid \n"+
              "LEFT JOIN course c \n"+
                "ON e.CourseNumber = c.CourseNumber\n"+
              "GROUP BY s.studentid \n"+
              "ORDER BY Name;\n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
    console.log("database.js: PROCEDURE get_students_for_owners created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_attendance_students` ( \n"+
              "IN CourseNum INT \n"+
            ") \n"+
            "BEGIN \n"+
              "SELECT s.StudentID, a.FirstName, a.LastName, s.Photograph, e.EnrollmentID, c.CourseNumber, c.Subject, \n"+
                      "att.AttendanceID AS TodayAttendanceID, att.Status AS TodayAttendanceStatus \n"+
              "FROM Student s \n"+
              "JOIN Application a \n"+
                "ON a.ApplicationID = s.ApplicationID \n"+
              "JOIN Enrollment e \n"+
                "ON e.StudentID = s.StudentID \n"+
              "JOIN Course c \n"+
                "ON c.CourseNumber = e.CourseNumber \n"+
              "LEFT JOIN Attendance att \n"+
                "ON att.EnrollmentID = e.EnrollmentID AND att.Date = CURDATE() \n"+
              "WHERE c.CourseNumber = CourseNum \n"+
                "AND e.Status = 'Active'; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_attendance_students created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_students_for_sponsors` ( \n"+
              "IN sponsorUserID INT \n"+
            ") \n"+
            "BEGIN \n"+
              "SELECT s.studentid, CONCAT(a.FirstName, ' ', a.LastName) AS Name, s.AdmissionDate, a.DateOfBirth, \n"+
                      "GROUP_CONCAT(CONCAT(c.Subject, ',', e.CertificateAchieved) SEPARATOR ': ') AS CourseDetails \n"+
              "FROM Student s \n"+
              "LEFT JOIN application a  \n"+
                "ON s.applicationid = a.ApplicationID \n"+
              "LEFT JOIN enrollment e  \n"+
                "ON e.studentid = s.studentid \n"+
              "LEFT JOIN course c \n"+
                "ON e.CourseNumber = c.CourseNumber \n"+
              "INNER JOIN StudentSponsors ss \n"+
                "ON s.studentid = ss.StudentID \n"+
              "INNER JOIN Sponsor sp \n"+
                "ON ss.Sponsorid = sp.SponsorID\n"+
              "WHERE sp.UserID = sponsorUserID\n"+
              "GROUP BY s.studentid \n"+
              "ORDER BY Name;\n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_students_for_sponsors created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `mark_attendance`( \n"+
              "IN p_EnrollmentID INT, \n"+
              "IN p_Status VARCHAR(10) \n"+
            ") \n"+
            "BEGIN \n"+
              "INSERT INTO Attendance (EnrollmentID, Date, Status) \n"+
              "VALUES (p_EnrollmentID, CURDATE(), p_Status); \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE mark_attendance created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `remove_attendance` ( \n"+
              "IN p_EnrollmentID INT \n"+
            ") \n"+
            "BEGIN \n"+
              "DELETE FROM Attendance \n"+
              "WHERE EnrollmentID = p_EnrollmentID \n"+
                "AND Date = CURDATE(); \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE remove_attendance created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `update_attendance` ( \n"+
              "IN p_AttendanceID INT, \n"+
              "IN p_Status VARCHAR(10) \n"+
            ") \n"+
            "BEGIN \n"+
              "UPDATE Attendance \n"+
              "SET Status = p_Status \n"+
              "WHERE AttendanceID = p_AttendanceID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE update_attendance created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_all_attendance_for_enrollment` ( \n"+
              "IN p_EnrollmentID INT \n"+
            ") \n"+
            "BEGIN \n"+
              "SELECT AttendanceID, EnrollmentID, Date, Status \n"+
              "FROM Attendance \n"+
              "WHERE EnrollmentID = p_EnrollmentID \n"+
              "ORDER BY Date ASC; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_all_attendance_for_enrollment created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `update_full_attendance` ( \n"+
              "IN p_AttendanceID INT, \n"+
              "IN p_Status VARCHAR(10), \n"+
              "IN p_Date DATE \n"+
            ") \n"+
            "BEGIN \n"+
              "UPDATE Attendance \n"+
              "SET Status = p_Status, Date = p_Date \n"+
              "WHERE AttendanceID = p_AttendanceID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE update_full_attendance created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `remove_attendance_by_id` ( \n"+
          "IN p_AttendanceID INT \n"+
        ") \n"+
        "BEGIN \n"+
          "DELETE FROM Attendance \n"+
          "WHERE AttendanceID = p_AttendanceID; \n"+
        "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE remove_attendance_by_id created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_active_students_with_times` () \n"+
            "BEGIN \n"+
                "SELECT s.StudentID, a.FirstName, a.LastName, GROUP_CONCAT(sa.DayOfWeek, ' ', sa.StartTime, '-', sa.EndTime SEPARATOR ', ') AS AvailableTimes \n"+
                "FROM Student s \n"+
                "JOIN Application a ON s.ApplicationID = a.ApplicationID \n"+
                "LEFT JOIN StudentAvailability sa ON s.StudentID = sa.StudentID \n"+
                "WHERE s.Status = 'Active' \n"+
                "GROUP BY s.StudentID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_active_students_with_times created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_all_courses_with_instructors` () \n"+
            "BEGIN \n"+
                "SELECT c.CourseNumber, c.Subject, CONCAT(u.FirstName, ' ', u.LastName) AS InstructorName, ct.DayOfWeek \n"+
                "FROM Course c \n"+
                "JOIN User u \n"+
                  "ON c.UserID = u.UserID \n"+
                "LEFT JOIN CourseTime ct ON c.CourseNumber = ct.CourseNumber; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_all_courses_with_instructors created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `enroll_student` ( \n"+
              "IN p_StudentID INT, \n"+
              "IN p_CourseNumber INT \n"+
            ") \n"+
            "BEGIN \n"+
              "DECLARE existing_enrollment INT; \n"+
              
              //Check if the student is already enrolled in the course
              "SELECT COUNT(*) INTO existing_enrollment \n"+
              "FROM Enrollment \n"+
              "WHERE StudentID = p_StudentID AND CourseNumber = p_CourseNumber AND Status = 'Active'; \n"+
              
              //If no existing enrollment, insert the new enrollment
              "IF existing_enrollment = 0 THEN \n"+
                "INSERT INTO Enrollment (StudentID, CourseNumber, Status, CertificateAchieved) \n"+
                "VALUES (p_StudentID, p_CourseNumber, 'Active', false); \n"+
              "END IF; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE enroll_student created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `update_student_availability` ( \n"+
              "IN p_AvailabilityID INT, \n"+
              "IN p_StudentID INT, \n"+
              "IN p_DayOfWeek VARCHAR(10), \n"+
              "IN p_StartTime TIME, \n"+
              "IN p_EndTime TIME \n"+
            ") \n"+
            "BEGIN \n"+
              "UPDATE StudentAvailability \n"+
              "SET DayOfWeek = p_DayOfWeek, StartTime = p_StartTime, EndTime = p_EndTime \n"+
              "WHERE AvailabilityID = p_AvailabilityID AND StudentID = p_StudentID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE update_student_availability created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `delete_student_availability` ( \n"+
              "IN p_AvailabilityID INT, \n"+
              "IN p_StudentID INT \n"+
            ") \n"+
            "BEGIN \n"+
              "DELETE FROM StudentAvailability \n"+
              "WHERE AvailabilityID = p_AvailabilityID AND StudentID = p_StudentID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE delete_student_availability created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `insert_student_availability` ( \n"+
              "IN p_StudentID INT, \n"+
              "IN p_DayOfWeek VARCHAR(10), \n"+
              "IN p_StartTime TIME, \n"+
              "IN p_EndTime TIME \n"+
            ") \n"+
            "BEGIN \n"+
              "INSERT INTO StudentAvailability (StudentID, DayOfWeek, StartTime, EndTime) \n"+
              "VALUES (p_StudentID, p_DayOfWeek, p_StartTime, p_EndTime); \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE insert_student_availability created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_student_schedule` ( \n"+
              "IN p_StudentID INT \n"+
            ") \n"+
            "BEGIN \n"+
              "SELECT c.Subject, CONCAT(u.FirstName, ' ', u.LastName) AS InstructorName, ct.DayOfWeek, ct.StartTime, ct.EndTime \n"+
              "FROM Enrollment e \n"+
              "JOIN Course c \n"+
                "ON e.CourseNumber = c.CourseNumber \n"+
              "JOIN User u \n"+
                "ON c.UserID = u.UserID \n"+
              "JOIN CourseTime ct \n"+
                "ON c.CourseNumber = ct.CourseNumber \n"+
              "WHERE e.StudentID = p_StudentID AND e.Status = 'Active'; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_student_schedule created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_absent_attendance` () \n"+
            "BEGIN \n"+
              "SELECT a.AttendanceID, CONCAT(app.FirstName, ' ', app.LastName) AS StudentName, c.Subject AS Course, a.Date \n"+
              "FROM Attendance a \n"+
              "JOIN Enrollment e \n"+
                "ON a.EnrollmentID = e.EnrollmentID \n"+
              "JOIN Student s \n"+ 
                "ON e.StudentID = s.StudentID \n"+
              "JOIN Application app \n"+ 
                "ON s.ApplicationID = app.ApplicationID \n"+
              "JOIN Course c \n"+ 
                "ON e.CourseNumber = c.CourseNumber \n"+
              "WHERE a.Status = 'Absent'; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_absent_attendance created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `update_attendance_status` ( \n"+
              "IN p_AttendanceID INT, \n"+
              "IN p_Status VARCHAR(10) \n"+
            ") \n"+
            "BEGIN \n"+
              "UPDATE Attendance \n"+
              "SET Status = p_Status \n"+
              "WHERE AttendanceID = p_AttendanceID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE update_attendance_status created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_all_students_with_details` () \n"+
            "BEGIN \n"+
              "SELECT s.StudentID, a.FirstName, a.LastName, a.OtherContact, s.Status, s.AdmissionDate, s.Photograph, a.NeedMealAssistance, a.NeedTransportationAssistance, \n"+
                    "GROUP_CONCAT(CONCAT(e.CourseNumber, ' - ', c.Subject) SEPARATOR ', ') AS Enrollments \n"+
              "FROM Student s \n"+
              "JOIN Application a \n"+
                "ON s.ApplicationID = a.ApplicationID \n"+
              "LEFT JOIN Enrollment e \n"+
                "ON s.StudentID = e.StudentID \n"+
              "LEFT JOIN Course c \n"+
                "ON e.CourseNumber = c.CourseNumber \n"+
              "GROUP BY s.StudentID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_all_students_with_details created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_student_notes` ( \n"+
              "IN p_StudentID INT \n"+
            ") \n"+
            "BEGIN \n"+
              "SELECT StudentNoteID, Note, Date \n"+
              "FROM StudentNote \n"+
              "WHERE StudentID = p_StudentID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_student_notes created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `insert_student_note` ( \n"+
              "IN p_StudentID INT, \n"+
              "IN p_UserID INT, \n"+
              "IN p_Note TEXT \n"+
            ") \n"+
            "BEGIN \n"+
              "INSERT INTO StudentNote (StudentID, UserID, Date, Note) \n"+
              "VALUES (p_StudentID, p_UserID, CURDATE(), p_Note); \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE insert_student_note created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `update_student_note` ( \n"+
              "IN p_StudentNoteID INT, \n"+
              "IN p_Note TEXT \n"+
            ") \n"+
            "BEGIN \n"+
              "UPDATE StudentNote \n"+
              "SET Note = p_Note \n"+
              "WHERE StudentNoteID = p_StudentNoteID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE update_student_note created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `delete_student_note` ( \n"+
              "IN p_StudentNoteID INT \n"+
            ") \n"+
            "BEGIN \n"+
              "DELETE FROM StudentNote \n"+
              "WHERE StudentNoteID = p_StudentNoteID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE delete_student_note created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_courses_by_instructor` ( \n"+
              "IN p_UserID INT \n"+
            ") \n"+
            "BEGIN \n"+
              "SELECT c.CourseNumber, c.Subject \n"+
              "FROM Course c \n"+
              "WHERE c.UserID = p_UserID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_courses_by_instructor created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_students_by_course` ( \n"+
              "IN p_CourseNumber INT \n"+
            ") \n"+
            "BEGIN \n"+
              "SELECT s.StudentID, CONCAT(a.FirstName, ' ', a.LastName) AS StudentName, e.EnrollmentID, e.CertificateAchieved \n"+
              "FROM Enrollment e \n"+
              "JOIN Student s \n"+
                "ON e.StudentID = s.StudentID \n"+
              "JOIN Application a \n"+
                "ON s.ApplicationID = a.ApplicationID \n"+
              "WHERE e.CourseNumber = p_CourseNumber AND e.Status = 'Active'; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE get_students_by_course created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `update_certificate_status` ( \n"+
              "IN p_EnrollmentID INT, \n"+
              "IN p_CertificateAchieved BOOL \n"+
            ") \n"+
            "BEGIN \n"+
              "UPDATE Enrollment \n"+
              "SET CertificateAchieved = p_CertificateAchieved \n"+
              "WHERE EnrollmentID = p_EnrollmentID; \n"+
            "END;";

  con.query(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: PROCEDURE update_certificate_status created if it didn't exist");
    }
  });
}

function AddTableData()
{
  //Adds 6 Users into the User Table (God, Admin, Instructor, Social Worker, Sponsor, Owner)
  let sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('God', 'Father', 'God@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'Admin')`;

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: God Admin Table Data inserted");
    }
  });

  sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('The', 'Monkey', 'TheMonkey@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'Admin')`;

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Admin Table Data inserted");
    }
  });

  sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('Brad', 'Peterson', 'BradPeterson@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'Instructor')`;

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Instructor Table Data inserted");
    }
  });

  sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('Isaac', 'Turk', 'IsaacTurk@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'SocialWorker')`;

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Social Worker Table Data inserted");
    }
  });

  sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('Bill', 'Gates', 'BillGates@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'Sponsor')`;

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Sponsor Table Data inserted");
    }
  });

  sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('Boss', 'Man', 'BossMan@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'Owner')`;

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Owner Table Data inserted");
    }
  });

  //Adds 4 Terms into the Term Table
  sql = `INSERT INTO Term (TermName, StartDate, EndDate) 
    VALUES ('Fall 2024', '2024-08-25', '2024-12-25')`;

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Term Data Fall 2024 Inserted");
    }
  });

  sql = `INSERT INTO Term (TermName, StartDate, EndDate) 
  VALUES ('Spring 2025', '2025-01-02', '2025-04-29')`;

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Term Data Spring 2025 Inserted");
    }
  });

  sql = `INSERT INTO Term (TermName, StartDate, EndDate) 
  VALUES ('Summer 2025', '2025-08-25', '2025-12-25')`;

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Term Data Summer 2025 Inserted");
    }
  });

  sql = `INSERT INTO Term (TermName, StartDate, EndDate) 
  VALUES ('Fall 2025', '2025-01-02', '2025-04-29')`;

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Term Data Fall 2025 Inserted");
    }
  });

  //Adds Bill Gates into the Sponsor Table
  sql = `INSERT INTO Sponsor (SponsorID, UserID, Organization, Contact) 
  VALUES (5, 5, 'Yes', 'Yes')`;

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Sponsor Data Inserted");
    }
  });
}

module.exports = con;