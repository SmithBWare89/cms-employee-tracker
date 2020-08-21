DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS employee;

-- Need tables for departments, roles, and employees
-- departments table
    --department name
    --department id
CREATE TABLE department (
    id INTEGER IDENTITY PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

--roles table
    --job title
    --role id
    --department role belongs to
    --salary for role
CREATE TABLE roles (
    id INTEGER IDENTITY PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    SALARY DECIMAL NOT NULL,
    department_id INTEGER UNSIGNED,
    CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL
);

--employee
    --first name
    --last name
CREATE TABLE employee (
    id INTEGER IDENTITY PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER UNSIGNED,
    manager_id INTEGER UNSIGNED,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL
);