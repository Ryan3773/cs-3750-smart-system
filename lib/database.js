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

  sql = "CREATE TABLE IF NOT EXISTS StudentGrades (\n"+
  "AssignmentID INT NOT NULL,\n"+
  "EnrollmentID INT NOT NULL,\n"+
  "Grade DECIMAL,\n"+
  "PRIMARY KEY (AssignmentID, EnrollmentID),\n"+
  "FOREIGN KEY (EnrollmentID) REFERENCES Enrollment(EnrollmentID),\n"+
  "FOREIGN KEY (AssignmentID) REFERENCES Assignments(AssignmentID)\n"+
  ");"

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
  ");"

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Attendance table created if it didn't exist");
    }
  });

  // Create StudentNote table
  sql = `
  CREATE TABLE IF NOT EXISTS StudentNote (
    StudentNoteID INT NOT NULL AUTO_INCREMENT,
    UserID INT NOT NULL,
    StudentID INT NOT NULL,
    Date DATE NOT NULL,
    Note TEXT,
    PRIMARY KEY (StudentNoteID),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
  );
  `;
  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: StudentNote table created if it didn't exist");
    }
  });

  con.execute(sql, function(err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Notes table created if it didn't exist");
    }
  });

  // Create StudentAvailability table
  sql = `
  CREATE TABLE IF NOT EXISTS StudentAvailability (
    AvailabilityID INT NOT NULL AUTO_INCREMENT,
    StudentID INT NOT NULL,
    DayOfWeek VARCHAR(10),
    StartTime TIME,
    EndTime TIME,
    PRIMARY KEY (AvailabilityID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
  );
  `;
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

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_assignments`(\n"+
  "CourseNumber INT \n"+
  ")\n"+
  "BEGIN \n"+
    "SELECT * FROM Assignments WHERE Assignments.CourseNumber = CourseNumber; \n"+
  "END;";
  
  con.query(sql, function(err, results, fields) {
    if (err) throw err;
    console.log("database.js: procedure get_assignments created if it didn't exist");
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
    if (err) throw err;
    console.log("database.js: procedure edit_assignments created if it didn't exist");
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
    if (err) throw err;
    console.log("database.js: procedure create_assignments created if it didn't exist");
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `delete_assignments`(\n"+
  "AssignmentID INT \n" +
  ") \n"+
  "BEGIN \n" +
    "DELETE FROM assignments \n"+
    "WHERE assignments.assignmentID = AssignmentID; \n"+
  "END;";

  con.query(sql, function(err, results, fields) {
    if (err) throw err;
    console.log("database.js: procedure delete_assignments created if it didn't exist");
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `delete_StudentGrades`(\n"+
  "AssignmentID INT \n" +
  ") \n"+
  "BEGIN \n" +
    "DELETE FROM StudentGrades \n"+
    "WHERE StudentGrades.AssignmentID = AssignmentID; \n"+
  "END;";

  con.query(sql, function(err, results, fields) {
    if (err) throw err;
    console.log("database.js: procedure delete_StudentGrades created if it didn't exist");
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_course_gradebook` (\n"+
  "CourseNumber INT\n"+
  ") \n"+
  "BEGIN \n"+
    "SELECT CONCAT(app.FirstName, ' ', app.LastName) AS StudentName,  e.EnrollmentID , a.AssignmentID, a.AssignmentName, COALESCE(sg.Grade, '-') AS Grade, a.PointsPossible \n"+
    "FROM enrollment e \n"+
    "JOIN Student s ON e.StudentID = s.StudentID \n"+
    "JOIN Application app ON s.ApplicationID = app.ApplicationID \n"+
    "JOIN Assignments a ON a.CourseNumber = e.CourseNumber \n"+
    "LEFT JOIN StudentGrades sg ON sg.EnrollmentID = e.EnrollmentID AND sg.AssignmentID = a.AssignmentID \n"+
    "WHERE e.CourseNumber = courseNumber \n"+
    "ORDER BY app.LastName, app.FirstName, a.AssignmentName;\n"+
  "END;";

  con.query(sql, function(err, results, fields) {
    if (err) throw err;
    console.log("database.js: procedure get_course_gradebook created if it didn't exist");
  });

sql = `
CREATE PROCEDURE IF NOT EXISTS get_attendance_students(
  IN CourseNum INT
)
BEGIN
  SELECT s.StudentID, a.FirstName, a.LastName, s.Photograph, e.EnrollmentID, c.CourseNumber, c.Subject,
         att.AttendanceID AS TodayAttendanceID,
         att.Status AS TodayAttendanceStatus
  FROM Student s
  JOIN Application a ON a.ApplicationID = s.ApplicationID
  JOIN Enrollment e ON e.StudentID = s.StudentID
  JOIN Course c ON c.CourseNumber = e.CourseNumber
  LEFT JOIN Attendance att ON att.EnrollmentID = e.EnrollmentID AND att.Date = CURDATE()
  WHERE c.CourseNumber = CourseNum
    AND e.Status = 'Active';
END
`;

sql = "CREATE PROCEDURE IF NOT EXISTS `get_students_for_owners` ()\n"+
  "BEGIN \n"+
    "SELECT s.studentid, CONCAT(a.FirstName, ' ', a.LastName) AS Name, s.AdmissionDate, a.DateOfBirth, GROUP_CONCAT(CONCAT(c.Subject, ',', e.CertificateAchieved) SEPARATOR ': ') AS CourseDetails \n"+
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
    if (err) throw err;
    console.log("database.js: procedure get_students_for_owners created if it didn't exist");
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_students_for_sponsors` (sponsorUserID INT)\n"+
  "BEGIN \n"+
    "SELECT s.studentid, CONCAT(a.FirstName, ' ', a.LastName) AS Name, s.AdmissionDate, a.DateOfBirth, GROUP_CONCAT(CONCAT(c.Subject, ',', e.CertificateAchieved) SEPARATOR ': ') AS CourseDetails \n"+
    "FROM Student s \n"+
    "LEFT JOIN application a  \n"+
    "ON s.applicationid = a.ApplicationID \n"+
    "LEFT JOIN enrollment e  \n"+
    "ON e.studentid = s.studentid \n"+
    "LEFT JOIN course c \n"+
    "ON e.CourseNumber = c.CourseNumber\n"+
    "INNER JOIN StudentSponsors ss ON s.studentid = ss.StudentID\n"+
    "INNER JOIN Sponsor sp ON ss.Sponsorid = sp.SponsorID\n"+
    "WHERE sp.UserID = sponsorUserID\n"+
    "GROUP BY s.studentid \n"+
    "ORDER BY Name;\n"+
  "END;";

  con.query(sql, function(err, results, fields) {
    if (err) throw err;
    console.log("database.js: procedure get_students_for_sponsors created if it didn't exist");
  });

con.query(sql, function(err, results, fields) {
  if (err) {
    console.log(err.message);
    throw err;
  } else {
    console.log("database.js: procedure get_attendance_students created/updated if it didn't exist");
  }
});

//Procedure to mark attendance
sql = `
CREATE PROCEDURE IF NOT EXISTS mark_attendance(
  IN p_EnrollmentID INT,
  IN p_Status VARCHAR(10)
)
BEGIN
  INSERT INTO Attendance (EnrollmentID, Date, Status)
  VALUES (p_EnrollmentID, CURDATE(), p_Status);
END;
`;

con.query(sql, function(err, results, fields) {
  if (err) {
    console.log(err.message);
    throw err;
  } else {
    console.log("database.js: procedure mark_attendance created if it didn't exist");
  }
});

//Procedure to remove today's attendance record for a student
sql = `
CREATE PROCEDURE IF NOT EXISTS remove_attendance(
  IN p_EnrollmentID INT
)
BEGIN
  DELETE FROM Attendance
  WHERE EnrollmentID = p_EnrollmentID
    AND Date = CURDATE();
END;
`;

con.query(sql, function(err, results, fields) {
  if (err) {
    console.log(err.message);
    throw err;
  } else {
    console.log("database.js: procedure remove_attendance created if it didn't exist");
  }
});

//Procedure to update an existing attendence record
sql = `
DROP PROCEDURE IF EXISTS update_attendance;
CREATE PROCEDURE update_attendance(
  IN p_AttendanceID INT,
  IN p_Status VARCHAR(10)
)
BEGIN
  UPDATE Attendance
  SET Status = p_Status
  WHERE AttendanceID = p_AttendanceID;
END;
`;

con.query(sql, function(err, results, fields) {
  if (err) {
    console.log(err.message);
    throw err;
  } else {
    console.log("database.js: procedure remove_attendance created if it didn't exist");
  }
});

// Procedure to get all attendance records for a given enrollment
sql = `
DROP PROCEDURE IF EXISTS get_all_attendance_for_enrollment;
CREATE PROCEDURE get_all_attendance_for_enrollment(
  IN p_EnrollmentID INT
)
BEGIN
  SELECT AttendanceID, EnrollmentID, Date, Status
  FROM Attendance
  WHERE EnrollmentID = p_EnrollmentID
  ORDER BY Date ASC;
END;
`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure get_all_attendance_for_enrollment created/updated");
});

// Procedure to update full attendance record (date and status)
sql = `
DROP PROCEDURE IF EXISTS update_full_attendance;
CREATE PROCEDURE update_full_attendance(
  IN p_AttendanceID INT,
  IN p_Status VARCHAR(10),
  IN p_Date DATE
)
BEGIN
  UPDATE Attendance
  SET Status = p_Status, Date = p_Date
  WHERE AttendanceID = p_AttendanceID;
END;
`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure update_full_attendance created/updated");
});

// Procedure to remove attendance by AttendanceID
sql = `
DROP PROCEDURE IF EXISTS remove_attendance_by_id;
CREATE PROCEDURE remove_attendance_by_id(
  IN p_AttendanceID INT
)
BEGIN
  DELETE FROM Attendance
  WHERE AttendanceID = p_AttendanceID;
END;
`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure remove_attendance_by_id created/updated");
});

// Procedure to get active students with their available times
sql = `
DROP PROCEDURE IF EXISTS get_active_students_with_times;
CREATE PROCEDURE get_active_students_with_times()
BEGIN
    SELECT s.StudentID, a.FirstName, a.LastName, GROUP_CONCAT(sa.DayOfWeek, ' ', sa.StartTime, '-', sa.EndTime SEPARATOR ', ') AS AvailableTimes
    FROM Student s
    JOIN Application a ON s.ApplicationID = a.ApplicationID
    LEFT JOIN StudentAvailability sa ON s.StudentID = sa.StudentID
    WHERE s.Status = 'Active'
    GROUP BY s.StudentID;
END;
`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure get_active_students_with_times created/updated");
});

// Procedure to get all courses within a student's given availability
sql = `
DROP PROCEDURE IF EXISTS get_all_courses_with_instructors;
CREATE PROCEDURE get_all_courses_with_instructors()
BEGIN
    SELECT c.CourseNumber, c.Subject, CONCAT(u.FirstName, ' ', u.LastName) AS InstructorName, ct.DayOfWeek
    FROM Course c
    JOIN User u ON c.UserID = u.UserID
    LEFT JOIN CourseTime ct ON c.CourseNumber = ct.CourseNumber;
END;
`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure get_all_courses_with_instructors created/updated");
});

// Procedure to enroll a student in a course
sql = `
DROP PROCEDURE IF EXISTS enroll_student;
CREATE PROCEDURE enroll_student(
  IN p_StudentID INT,
  IN p_CourseNumber INT
)
BEGIN
  DECLARE existing_enrollment INT;
  
  -- Check if the student is already enrolled in the course
  SELECT COUNT(*) INTO existing_enrollment
  FROM Enrollment
  WHERE StudentID = p_StudentID AND CourseNumber = p_CourseNumber AND Status = 'Active';
  
  -- If no existing enrollment, insert the new enrollment
  IF existing_enrollment = 0 THEN
    INSERT INTO Enrollment (StudentID, CourseNumber, Status, CertificateAchieved)
    VALUES (p_StudentID, p_CourseNumber, 'Active', false);
  END IF;
END;
`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure enroll_student created/updated");
});

// Procedure to update student availability
sql = `
DROP PROCEDURE IF EXISTS update_student_availability;
CREATE PROCEDURE update_student_availability(
  IN p_AvailabilityID INT,
  IN p_StudentID INT,
  IN p_DayOfWeek VARCHAR(10),
  IN p_StartTime TIME,
  IN p_EndTime TIME
)
BEGIN
  UPDATE StudentAvailability
  SET DayOfWeek = p_DayOfWeek, StartTime = p_StartTime, EndTime = p_EndTime
  WHERE AvailabilityID = p_AvailabilityID AND StudentID = p_StudentID;
END;
`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure update_student_availability created/updated");
});

// Procedure to delete student availability
sql = `
DROP PROCEDURE IF EXISTS delete_student_availability;
CREATE PROCEDURE delete_student_availability(
  IN p_AvailabilityID INT,
  IN p_StudentID INT
)
BEGIN
  DELETE FROM StudentAvailability
  WHERE AvailabilityID = p_AvailabilityID AND StudentID = p_StudentID;
END;
`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure delete_student_availability created/updated");
});

// Procedure to insert student availability
sql = `
DROP PROCEDURE IF EXISTS insert_student_availability;
CREATE PROCEDURE insert_student_availability(
  IN p_StudentID INT,
  IN p_DayOfWeek VARCHAR(10),
  IN p_StartTime TIME,
  IN p_EndTime TIME
)
BEGIN
  INSERT INTO StudentAvailability (StudentID, DayOfWeek, StartTime, EndTime)
  VALUES (p_StudentID, p_DayOfWeek, p_StartTime, p_EndTime);
END;
`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure insert_student_availability created/updated");
});

// Procedure to get student schedule
sql = `
DROP PROCEDURE IF EXISTS get_student_schedule;
CREATE PROCEDURE get_student_schedule(
  IN p_StudentID INT
)
BEGIN
  SELECT c.Subject, CONCAT(u.FirstName, ' ', u.LastName) AS InstructorName, ct.DayOfWeek, ct.StartTime, ct.EndTime
  FROM Enrollment e
  JOIN Course c ON e.CourseNumber = c.CourseNumber
  JOIN User u ON c.UserID = u.UserID
  JOIN CourseTime ct ON c.CourseNumber = ct.CourseNumber
  WHERE e.StudentID = p_StudentID AND e.Status = 'Active';
END;
`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure get_student_schedule created/updated");
});

// Procedure to get absent student absence records
sql = `
DROP PROCEDURE IF EXISTS get_absent_attendance;
CREATE PROCEDURE get_absent_attendance()
BEGIN
  SELECT a.AttendanceID, CONCAT(app.FirstName, ' ', app.LastName) AS StudentName,
         c.Subject AS Course, a.Date
  FROM Attendance a
  JOIN Enrollment e ON a.EnrollmentID = e.EnrollmentID
  JOIN Student s ON e.StudentID = s.StudentID
  JOIN Application app ON s.ApplicationID = app.ApplicationID
  JOIN Course c ON e.CourseNumber = c.CourseNumber
  WHERE a.Status = 'Absent';
END`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure get_absent_attendance created/updated");
});

// Procedure to update attendance status (Social Worker)
sql = `
DROP PROCEDURE IF EXISTS update_attendance_status;
CREATE PROCEDURE update_attendance_status(
  IN p_AttendanceID INT,
  IN p_Status VARCHAR(10)
)
BEGIN
  UPDATE Attendance
  SET Status = p_Status
  WHERE AttendanceID = p_AttendanceID;
END`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure update_attendance_status created/updated");
});

// Procedure to fetch student information for Social Worker
sql = `
DROP PROCEDURE IF EXISTS get_all_students_with_details;
CREATE PROCEDURE get_all_students_with_details()
BEGIN
  SELECT s.StudentID, a.FirstName, a.LastName, a.OtherContact, s.Status, s.AdmissionDate, s.Photograph, a.NeedMealAssistance, a.NeedTransportationAssistance,
         GROUP_CONCAT(CONCAT(e.CourseNumber, ' - ', c.Subject) SEPARATOR ', ') AS Enrollments
  FROM Student s
  JOIN Application a ON s.ApplicationID = a.ApplicationID
  LEFT JOIN Enrollment e ON s.StudentID = e.StudentID
  LEFT JOIN Course c ON e.CourseNumber = c.CourseNumber
  GROUP BY s.StudentID;
END;
`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure get_all_students_with_details created/updated");
});

// Procedure to fetch notes
sql = `
DROP PROCEDURE IF EXISTS get_student_notes;
CREATE PROCEDURE get_student_notes(IN p_StudentID INT)
BEGIN
  SELECT StudentNoteID, Note, Date
  FROM StudentNote
  WHERE StudentID = p_StudentID;
END`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure get_student_notes created/updated");
});

// Procedure to insert note
sql = `
DROP PROCEDURE IF EXISTS insert_student_note;
CREATE PROCEDURE insert_student_note(IN p_StudentID INT, IN p_UserID INT, IN p_Note TEXT)
BEGIN
  INSERT INTO StudentNote (StudentID, UserID, Date, Note)
  VALUES (p_StudentID, p_UserID, CURDATE(), p_Note);
END`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure insert_student_note created/updated");
});

// Procedure to update note
sql = `
DROP PROCEDURE IF EXISTS update_student_note;
CREATE PROCEDURE update_student_note(IN p_StudentNoteID INT, IN p_Note TEXT)
BEGIN
  UPDATE StudentNote
  SET Note = p_Note
  WHERE StudentNoteID = p_StudentNoteID;
END;`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure update_student_note created/updated");
});

// Procedure to delete note
sql = `
DROP PROCEDURE IF EXISTS delete_student_note;
CREATE PROCEDURE delete_student_note(IN p_StudentNoteID INT)
BEGIN
  DELETE FROM StudentNote
  WHERE StudentNoteID = p_StudentNoteID;
END;`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure delete_student_note created/updated");
});

// Procedure to fetch courses taught by instructor (Certificate page)
sql = `
DROP PROCEDURE IF EXISTS get_courses_by_instructor;
CREATE PROCEDURE get_courses_by_instructor(IN p_UserID INT)
BEGIN
  SELECT c.CourseNumber, c.Subject
  FROM Course c
  WHERE c.UserID = p_UserID;
END`;
con.query(sql, function(err, results, fields) {
  if (err) throw err;
  console.log("database.js: procedure get_courses_by_instructor created/updated");
});

  // Procedure to fetch students enrolled in a course (Certificate page)
  sql = `
  DROP PROCEDURE IF EXISTS get_students_by_course;
  CREATE PROCEDURE get_students_by_course(IN p_CourseNumber INT)
  BEGIN
    SELECT s.StudentID, CONCAT(a.FirstName, ' ', a.LastName) AS StudentName, e.EnrollmentID, e.CertificateAchieved
    FROM Enrollment e
    JOIN Student s ON e.StudentID = s.StudentID
    JOIN Application a ON s.ApplicationID = a.ApplicationID
    WHERE e.CourseNumber = p_CourseNumber AND e.Status = 'Active';
  END`;
  con.query(sql, function(err, results, fields) {
    if (err) throw err;
    console.log("database.js: procedure get_students_by_course created/updated");
  });

  // Procedure to update certificate status
  sql = `
  DROP PROCEDURE IF EXISTS update_certificate_status;
  CREATE PROCEDURE update_certificate_status(IN p_EnrollmentID INT, IN p_CertificateAchieved BOOL)
  BEGIN
    UPDATE Enrollment
    SET CertificateAchieved = p_CertificateAchieved
    WHERE EnrollmentID = p_EnrollmentID;
  END`;
  con.query(sql, function(err, results, fields) {
    if (err) throw err;
    console.log("database.js: procedure update_certificate_status created/updated");
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
      console.log("database.js: God Admin Table Data inserted");
    }
  });

  sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('The', 'Monkey', 'TheMonkey@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'Admin')`;
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

  sql = `INSERT INTO User (FirstName, LastName, Email, Password, Salt, UserType) 
    VALUES ('Demenstrate', 'Murder', 'Kill@gmail.com', '9bbd9f401a7be4d06090d164a387bd060f42e7fb37068619ec4ca80ccb4d2c14', 'b1aebcaec4864221', 'Instructor')`;
  con.execute(sql, function(err, results, fields) {
    if (err) 
    {
      throw err;
    } 
    else 
    {
      console.log("database.js: Fired Instructor Table Data inserted");
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