INSERT INTO department (deptname)
    VALUES
        ('Finance'),
        ('Marketing');

INSERT INTO roles (title, salary, department_id)
    VALUES
        ('Executive', 120000.00, 1),
        ('Manager', 91563.63, 1),
        ('Assistant Manager', 75456.12, 1),
        ('Analyst', 60250.50, 2),
        ('Specialist', 45785.50, 2);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
    VALUES
        ('Shane', 'Dodson', 1, 0),
        ('Alicia', 'Warrington', 1, 0),
        ('Gabriel', 'Kidd', 2, 2),
        ('James', 'Madison', 3, 3),
        ('D.A.', 'Brewer', 2, 3),
        ('Angel', 'Gutierrez', 4, 5);