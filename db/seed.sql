
TRUNCATE TABLE employee RESTART IDENTITY CASCADE;
TRUNCATE TABLE role RESTART IDENTITY CASCADE;
TRUNCATE TABLE department RESTART IDENTITY CASCADE;


INSERT INTO department (name) VALUES
    ('Human Resources'),
    ('Engineering'),
    ('Marketing'),
    ('Sales');


INSERT INTO role (title, salary, department_id) VALUES
    ('HR Manager', 60000, 1),
    ('Software Engineer', 80000, 2),
    ('Marketing Specialist', 55000, 3),
    ('Sales Associate', 50000, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('Alice', 'Johnson', 2, NULL),
    ('Bob', 'Smith', 4, NULL);
