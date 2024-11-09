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
        //CreateTables();
        //CreateStoredProcedures();
        //AddTableData();
      }
    });
}

module.exports = con;