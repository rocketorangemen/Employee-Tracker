const mysql = require("mysql2");
const inquirer = require("inquirer");
const consoleTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  // Your MySQL password
  password: "Monnie08*",
  database: "employeeDB",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "/n");
  startApp();
});

// opening function for app
function startApp() {
  inquirer
    .prompt({
      type: "list",
      name: "answer",
      message: "Select An Option",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "Add a Department",
        "Add a Role",
        "Add an Employee",
        "Update an Employee Role",
      ],
    })
    .then((response) => {
      switch (response.answer) {
        case "View All Departments":
          viewDept();
          break;
        case "View All Roles":
          viewRoles();
          break;
        case "View All Employees":
          viewEmp();
          break;
        case "Add a Department":
          addDept();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Add an Employee":
          addEmp();
          break;
        case "Update an Employee Role":
          updateEmpRole();
          break;
      }
    });
}

// View all departments
function viewDept() {
  let query = 'SELECT id AS "ID", name AS "Department Name" FROM department;';
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}

// View all roles and corresponding relevant information
function viewRoles() {
  let query =
    'SELECT r.id AS "ID", r.title AS "Job Title", r.salary AS "Salary", dep.name AS "Department" from role r LEFT JOIN department dep ON dep.id = r.department_id;';
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}

// View all employees and corresponding relevant information
function viewEmp() {
  let query =
    'SELECT emp.id, emp.first_name AS "First Name", emp.last_name AS "Last Name", r.title, dep.name AS "Department", r.salary AS "Salary", CONCAT(man.first_name," ",man.last_name) AS "Manager" FROM employee emp LEFT JOIN role r ON r.id = emp.role_id LEFT JOIN department dep ON dep.id = r.department_id LEFT JOIN employee man ON man.id = emp.manager_id ORDER BY emp.id;';
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}


// Adds a new employee with all the necessary information
function addEmp() {
  console.log("Inserting a new employee...\n");
  let query = "SELECT * FROM role";
  connection.query(query, function (err, res) {
    if (err) throw err;
    let roleArray = res.map((roles) => roles.title);
    inquirer
      .prompt([
        {
          type: "input",
          name: "newFirst",
          message: "Enter the employee's first name",
          validate: (newFirstInput) => {
            if (newFirstInput) {
              return true;
            } else {
              console.log("Please enter the new employee's first name");
              return false;
            }
          },
        },
        {
          type: "input",
          name: "newLast",
          message: "Enter the employee's last name",
          validate: (newLastInput) => {
            if (newLastInput) {
              return true;
            } else {
              console.log("Please enter the new employee's last name");
              return false;
            }
          },
        },
        {
          type: "list",
          name: "empRole",
          choices: roleArray,
          message: "Select the role of the new employee",
        },
      ])
      .then((response) => {
        connection.query(
          `INSERT INTO employee(first_name, last_name, role_id) VALUES ("${response.newFirst}", "${response.newLast}", (SELECT id FROM role WHERE title = "${response.empRole}"));`
        );
        startApp();
      });
  });
}