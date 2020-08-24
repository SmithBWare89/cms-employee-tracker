const mysql = require('mysql2');
const ctable = require('console.table');
const inquirer = require('inquirer');
// const Department = require('./lib/department');
// const Employee = require('./lib/employee');
// const Roles = require('./lib/roles');

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
    const [rows, fields] = await promisePool.execute(`SELECT * FROM department;`);
    const table = ctable.getTable(rows);
    console.log(table);
    start();
};

viewRoles = async () => {
    const [rows, fields] = await promisePool.execute(`SELECT * FROM roles;`);
    const table = ctable.getTable(rows);
    console.log(table);
    start();
}

viewEmployees = async () => {
    const [rows, fields] = await promisePool.execute(`SELECT * FROM employee;`);
    const table = ctable.getTable(rows);
    console.log(table);
    start();
}

addDepartment = async () => {
    inquirer
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
        .then(async ({department}) => {
            const sql = `INSERT INTO department SET ?`;
            const params = {
                deptname: department
            }
            const query = await promisePool.query(sql, params, function (err, results, fields) {
                if(err) throw err;
            });
            return start();
        })
}

addRole = async () => {
    inquirer
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
                when: ({title}) => title,
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
            }
        ])
        .then(async ({title, salary}) => {
            const sql = 'INSERT INTO roles SET ?;';
            const params = {
                title: title,
                salary: salary,
                department_id: 1
            };
            const [rows, fields] = await promisePool.query(sql,params);
            start();
        })
}

addEmployee = async () => {
    try{
        const deptSQL = `SELECT * FROM department;`;
        const deptArray = [];
        const [dept, meta] = await promisePool.execute(deptSQL);
        dept.filter(item => {deptArray.push(item.deptname)});
    
        const roleSQL = `SELECT * FROM roles;`;
        const rolesArray = [];
        const [role, info] = await promisePool.execute(roleSQL);
        role.filter(role => rolesArray.push(role.title));

        const managersSQL = `SELECT * FROM employee WHERE role_id = 2;`;
        const managersArray = [];
        const [manager, useless] = await promisePool.execute(managersSQL);
        manager.filter(item => managersArray.push(`${item.first_name} ${item.last_name}`));

        inquirer
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
            .then(async ({firstName, lastName, employeeRole, employeeManager}) => {
                const chosenRole = role.find(item => {
                    if (employeeRole === item.title){
                        return item.id;
                    }
                    return null;
                })

                // console.log(chosenRole.id);

                const managerId = manager.find(item => {
                    const name = `${item.first_name} ${item.last_name}`;
                    return employeeManager === name;
                })

                const sql = `INSERT INTO employee SET ?`;
                const params = {
                    first_name: firstName,
                    last_name: lastName,
                    role_id: chosenRole.id,
                    manager_id: managerId.id
                }
                const [rows, fields] = await promisePool.query(sql, params);
                start();
            })
    } catch (err){
        console.log(err);
    }
}

updateEmployee = async () => {
    const employeeSQL = `SELECT * FROM employee;`
    const employeeArray = [];
    const [employeeRow, arrField] = await promisePool.query(employeeSQL);
    employeeRow.forEach(item => {
        employeeArray.push(`${item.first_name} ${item.last_name}`);
    });

    const managersSQL = `SELECT * FROM employee WHERE role_id = 2;`;
    const managersArray = [];
    const [manager, mgrField] = await promisePool.execute(managersSQL);
    manager.filter(item => managersArray.push(`${item.first_name} ${item.last_name}`));

    const roleSQL = `SELECT * FROM roles;`;
    const rolesArray = [];
    const [role, info] = await promisePool.execute(roleSQL);
    role.filter(role => rolesArray.push(role.title));
    
    inquirer
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
        .then(async ({employee, newFirstName, newLastName, newManager, newRole}) => {
            const sql = `UPDATE employee SET ? WHERE ?`;

            const matched = employeeRow.find(item => {
                const name = `${item.first_name} ${item.last_name}`;
                return name === employee;
            });

            if (newFirstName) {
                const params = [{first_name: newFirstName}, {id: matched.id}];
                const query = await promisePool.query(sql, params);
            };

            if (newLastName) {
                const params = [{last_name: newLastName}, {id: matched.id}];
                const query = await promisePool.query(sql, params);
            };

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
            if(newRole){
                const roleObj = role.find(item => item.title === newRole);
                const params = [{role_id: roleObj.id}, {id: matched.id}]
                const query = await promisePool.query(sql, params);
            }
            start();
        })
}

start();