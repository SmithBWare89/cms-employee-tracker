const mysql = require('mysql2');
const ctable = require('console.table');
const inquirer = require('inquirer');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'employees'
});

const promisePool = pool.promise();

start = () => {
    inquirer
        .prompt(
            {
                type: 'list',
                name: 'input',
                message: 'What would you like to do?',
                choices: ['View All Departments', 
                'View All Roles', 
                'View All Employees',
                'Add A Department',
                'Add A Role',
                'Add An Employee',
                'Update An Employee']
            }
        )
        .then(({input, department}) => {
                if (input === 'View All Departments'){
                    viewDepartments();
                } 
                if (input === 'View All Roles') {
                    viewRoles();
                }
                if (input === 'View All Employees'){
                    viewEmployees();
                }
                if (input === 'Add A Department'){
                    addDepartment(department);
                }
                if (input === 'Add A Role'){
                    addRole();
                }
                if (input === 'Add An Employee'){
                    addEmployee()
                }
                if(input === 'Update An Employee'){
                    updateEmployee();
                }                    

        })
}

viewDepartments = async () =>{
    // SQL Statement
    const sql = `
    SELECT department.id AS ID, department.deptname AS Department
    FROM department`
    // Select All Departments
    const [rows, fields] = await promisePool.query(sql);
    // Format Into Table
    const table = ctable.getTable(rows);
    // Print Table
    console.log(table);
    // Restart
    start();
};

viewRoles = async () => {
    // SQL Statement
    const sql = `
    SELECT roles.id AS ID, roles.title AS Title, roles.salary AS Salary, department.deptname AS Department
    FROM roles
    LEFT JOIN department ON department.id = roles.department_id`
    // Select All Roles
    const [rows, fields] = await promisePool.query(sql);
    // Format Into Table
    const table = ctable.getTable(rows);
    // Print Table
    console.log(table);
    // Restart
    start();
}

viewEmployees = async () => {
    // SQL Statement
    const sql = `
    SELECT employee.id AS ID, first_name AS First_Name, last_name AS Last_Name, roles.title AS Role, roles.salary AS Salary, department.deptname AS Department
    FROM employee
    LEFT JOIN roles ON roles.id = employee.role_id
    LEFT JOIN department ON department.id = roles.department_id;
    `
    // Select All Employees
    const [rows, fields] = await promisePool.query(sql);
    // Format Query Data Into Table
    const table = ctable.getTable(rows);
    // Print Formatted Table
    console.log(table);
    // Restart Process
    start();
}

addDepartment = async () => {
    inquirer
    // User Prompt
        .prompt(
            {
                type: 'input',
                name: 'department',
                message: 'Please enter the departments name:',
                validate: function (input) {
                    // Declare function as asynchronous, and save the done callback
                    let regex = /[^a-zA-Z ]/g;
                    if (!input.trim()) {
                        return 'Please enter a name.';
                    } 
                    if (regex.test(input)) {
                        return 'Name cannot contain digits or special characters.';
                    }
                    return true;
                }
            }
        )
    // Logic
        .then(async ({department}) => {
            // SQL Statement
            const sql = `INSERT INTO department SET ?`;
            // Statement Parameters
            const params = {
                deptname: department
            }
            // Query
            const query = await promisePool.query(sql, params, function (err, results, fields) {
                if(err) throw err;
            });
            // Restart Process
            start();
        })
}

addRole = async () => {
    // Select All Department Names And Push Into Array
    const deptSQL = `SELECT * FROM department;`;
    const deptArray = [];
    const [dept, meta] = await promisePool.execute(deptSQL);
    dept.filter(item => {deptArray.push(item.deptname)});

    inquirer
    // User prompts
        .prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Please enter the new roles name:',
                validate: function (input) {
                    // Declare function as asynchronous, and save the done callback
                    let regex = /[^a-zA-Z ]/g;
                    if (!input.trim()) {
                        return 'Please enter a name.';
                    } 
                    if (regex.test(input)) {
                        return 'Name cannot contain digits or special characters.';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Please enter the salary for the new role',
                validate: function(input){
                    const number = Number(input);
                    if(typeof number !== 'number' || isNaN(number)){
                        return 'Please enter a valid salary.';
                    }
                    else if(input.indexOf('.') === -1){
                        return 'Please enter a decimal place for the salary.';
                    }
                    return true;
                }
            },
            {
                type: 'list',
                name: 'department',
                message: 'Please select the department this role belongs to:',
                choices: deptArray
            }
        ])
    // Logic
        .then(async ({title, salary, department}) => {
            const matched = dept.find(item => item.deptname === department)
            // SQL
            const sql = 'INSERT INTO roles SET ?;';
            // Set Query Parameters
            const params = {
                title: title,
                salary: salary,
                department_id: matched.id
            };
            // Perform Query
            const [rows, fields] = await promisePool.query(sql,params);
            // Restart Process
            start();
        })
}

addEmployee = async () => {
    try{
        // Select All Department Names And Push Into Array
        const deptSQL = `SELECT * FROM department;`;
        const deptArray = [];
        const [dept, meta] = await promisePool.execute(deptSQL);
        dept.filter(item => {deptArray.push(item.deptname)});
        
        // Select All Role Names And Push Into Array
        const roleSQL = `SELECT * FROM roles;`;
        const rolesArray = [];
        const [role, info] = await promisePool.execute(roleSQL);
        role.filter(role => rolesArray.push(role.title));

        // Select All Managers And Push Into Array
        const managersSQL = `SELECT * FROM employee WHERE role_id = 2;`;
        const managersArray = [];
        const [manager, useless] = await promisePool.execute(managersSQL);
        manager.filter(item => managersArray.push(`${item.first_name} ${item.last_name}`));

        inquirer
        // Prompt User
            .prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'Please enter the employees first name:',
                    validate: function (input) {
                        // Declare function as asynchronous, and save the done callback
                        let regex = /[^a-zA-Z ]/g;
                        if (!input.trim()) {
                            return 'Please enter a name.';
                        } 
                        if (regex.test(input)) {
                            return 'Name cannot contain digits or special characters.';
                        }
                        return true;
                    }
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'Please enter the employees last name:',
                    validate: function (input) {
                        // Declare function as asynchronous, and save the done callback
                        let regex = /[^a-zA-Z ]/g;
                        if (!input.trim()) {
                            return 'Please enter a name.';
                        } 
                        if (regex.test(input)) {
                            return 'Name cannot contain digits or special characters.';
                        }
                        return true;
                    }
                },
                {
                    type: 'list',
                    name: 'employeeRole',
                    message: 'Please select the employees role title:',
                    choices: [...rolesArray, 'None']
                },
                {
                    type: 'list',
                    name: 'employeeManager',
                    message: 'Please select the employees manager:',
                    choices: [...managersArray, 'None']
                }
            ])
        // Then Perform Logic
            .then(async ({firstName, lastName, employeeRole, employeeManager}) => {
                // SQL Statement
                const sql = `INSERT INTO employee SET ?`;

                // Attempt to find the chosen role in the database
                const chosenRole = role.find(item => {
                    return employeeRole === item.title ? true : null;
                })
                // Find the selected manager in the database
                const managerId = manager.find(item => {
                    const name = `${item.first_name} ${item.last_name}`;
                    return employeeManager === name ? true : null;
                })

                // Employee Role AND Employee Manager Selected
                if(employeeRole !== 'None' && employeeManager !== 'None') {
                    const params = {
                        first_name: firstName,
                        last_name: lastName,
                        role_id: chosenRole.id,
                        manager_id: managerId.id
                    }
                    const [rows, fields] = await promisePool.query(sql, params);
                } 
                // ONLY Employee Role Selected
                else if (employeeRole && (employeeManager === 'None')) {
                    const params = {
                        first_name: firstName,
                        last_name: lastName,
                        role_id: chosenRole.id
                }
                    const [rows, fields] = await promisePool.query(sql, params);
                } 
                // ONLY Employee Manager Selected
                else if (employeeRole === 'None' && employeeManager) {
                    const params = {
                        first_name: firstName,
                        last_name: lastName,
                        manager_id: managerId.id
                    }
                    const [rows, fields] = await promisePool.query(sql, params);
                }
                // Restart Process
                start();
            })
    } catch (err){
        console.log(err);
    }
}

updateEmployee = async () => {
    // Find All Employees And Push Names Into An Array
    const employeeSQL = `SELECT * FROM employee;`
    const employeeArray = [];
    const [employeeRow, arrField] = await promisePool.query(employeeSQL);
    employeeRow.forEach(item => {
        employeeArray.push(`${item.first_name} ${item.last_name}`);
    });

    // Find All Managers And Push Names Into An Array
    const managersSQL = `SELECT * FROM employee WHERE role_id = 2;`;
    const managersArray = [];
    const [manager, mgrField] = await promisePool.execute(managersSQL);
    manager.filter(item => managersArray.push(`${item.first_name} ${item.last_name}`));

    // Find All Roles And Push Names Into An Array
    const roleSQL = `SELECT * FROM roles;`;
    const rolesArray = [];
    const [role, info] = await promisePool.execute(roleSQL);
    role.filter(role => rolesArray.push(role.title));
    
    inquirer
    // Prompt The User
        .prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Please select the employee you wish to update:',
                choices: employeeArray
            },
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to update about this employee?',
                choices: ['Update First Name', 'Update Last Name', 'Update Role', 'Update Manager']
            },
            {
                type: 'input',
                name: 'newFirstName',
                message: 'Please enter the employees new first name:',
                when: ({choice}) => choice === 'Update First Name',
                validate: function (input) {
                    // Declare function as asynchronous, and save the done callback
                    let regex = /[^a-zA-Z ]/g;
                    if (!input.trim()) {
                        return 'Please enter a name.';
                    } 
                    if (regex.test(input)) {
                        return 'Name cannot contain digits or special characters.';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'newLastName',
                message: 'Please enter the employees new last name:',
                when: ({choice}) => choice === 'Update Last Name',
                validate: function (input) {
                    // Declare function as asynchronous, and save the done callback
                    let regex = /[^a-zA-Z ]/g;
                    if (!input.trim()) {
                        return 'Please enter a name.';
                    } 
                    if (regex.test(input)) {
                        return 'Name cannot contain digits or special characters.';
                    }
                    return true;
                }
            },
            {
                type: 'list',
                name: 'newManager',
                message: 'Please select a new manager:',
                when:({choice}) => choice === 'Update Manager',
                choices: managersArray
            },
            {
                type: 'list',
                name: 'newRole',
                message: 'Please select a new role for the employee:',
                when: ({choice}) => choice === 'Update Role',
                choices: rolesArray
            }
        ])
    // Then Perform Logic
        .then(async ({employee, newFirstName, newLastName, newManager, newRole}) => {
            // UPDATE Statement
            const sql = `UPDATE employee SET ? WHERE ?`;

            // Find Employee Object In Database
            const matched = employeeRow.find(item => {
                const name = `${item.first_name} ${item.last_name}`;
                return name === employee;
            });

            // Update First Name
            if (newFirstName) {
                const params = [{first_name: newFirstName}, {id: matched.id}];
                const query = await promisePool.query(sql, params);
            };
            // Update Last Name
            if (newLastName) {
                const params = [{last_name: newLastName}, {id: matched.id}];
                const query = await promisePool.query(sql, params);
            };
            // Update Manager
            if(newManager){
                const managerObj = manager.find(item => {
                    const managerName = (`${item.first_name} ${item.last_name}`);
                    return managerName === newManager;
                });
                const params = [
                    {manager_id: managerObj.id}, 
                    {id: matched.id}
                ];
                const query = await promisePool.query(sql, params);
            }
            // Update Employee Role
            if(newRole){
                const roleObj = role.find(item => item.title === newRole);
                const params = [{role_id: roleObj.id}, {id: matched.id}]
                const query = await promisePool.query(sql, params);
            }
            // Start process again
            start();
        })
}

start();