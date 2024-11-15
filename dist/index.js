import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';
await connectToDb();
const initQ = [
    {
        type: 'list',
        name: 'selection',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'quit'
        ]
    }
];
async function init() {
    try {
        const { selection } = await inquirer.prompt(initQ);
        switch (selection) {
            case 'View all departments':
                await viewDepartments();
                break;
            case 'View all roles':
                await viewAllRoles();
                break;
            case 'View all employees':
                await viewAllEmployees();
                break;
            case 'Add a department':
                await addDepartment();
                break;
            case 'Add a role':
                await addRole();
                break;
            case 'Add an employee':
                await addEmployee();
                break;
            case 'Update an employee role':
                await updateEmployee();
                break;
            case 'quit':
                await quit();
                break;
            default:
                break;
        }
    }
    catch (err) {
        console.error('Error in main menu:');
    }
}
async function viewDepartments() {
    try {
        const result = await pool.query('SELECT * FROM department;');
        console.table(result.rows);
    }
    catch (err) {
        console.error('Error fetching departments:');
    }
    finally {
        await init();
    }
}
async function viewAllRoles() {
    try {
        const result = await pool.query(`
            SELECT 
                r.id AS "Role ID",
                r.title AS "Job Title",
                d.name AS "Department",
                r.salary AS "Salary"
            FROM role r
            LEFT JOIN department d ON r.department_id = d.id;
        `);
        console.table(result.rows);
    }
    catch (err) {
        console.error('Error fetching roles:', err);
    }
    finally {
        await init();
    }
}
async function viewAllEmployees() {
    try {
        const result = await pool.query(`
            SELECT 
                e.id AS "Employee ID",
                e.first_name AS "First Name",
                e.last_name AS "Last Name",
                r.title AS "Job Title",
                d.name AS "Department",
                r.salary AS "Salary",
                CONCAT(m.first_name, ' ', m.last_name) AS "Manager"
            FROM employee e
            LEFT JOIN role r ON e.role_id = r.id
            LEFT JOIN department d ON r.department_id = d.id
            LEFT JOIN employee m ON e.manager_id = m.id;
        `);
        console.table(result.rows); // Imprime los resultados en forma de tabla
    }
    catch (err) {
        console.error('Error fetching employees:', err); // Muestra errores si ocurren
    }
    finally {
        await init(); // Vuelve al menú principal
    }
}
async function addDepartment() {
    try {
        const response = await inquirer.prompt([
            {
                type: 'input',
                name: 'department',
                message: 'Enter the name of the new department?',
                validate: (input) => input.trim() ? true : 'Department name cannot be empty.'
            }
        ]);
        await pool.query('INSERT INTO department (name) VALUES ($1)', [response.department]);
        console.log('New department added successfully');
    }
    catch (err) {
        console.error('Error adding department:', err);
    }
    finally {
        await init();
    }
}
async function addRole() {
    try {
        // Obtener la lista de departments
        const data = await pool.query('SELECT * FROM department');
        const departments = data.rows.map((d) => ({ name: d.name, value: d.id }));
        const response = await inquirer.prompt([
            {
                type: 'input',
                name: 'role_title', // Cambié el nombre a 'role_title' para coincidir con el campo 'title' en la base de datos
                message: 'Enter a title for the new role?',
                validate: (input) => input.trim() ? true : 'Role title cannot be empty.'
            },
            {
                type: 'input',
                name: 'role_salary',
                message: 'Enter the salary for the new role?',
                validate: (input) => !isNaN(input) && input > 0 ? true : 'Salary must be a positive number.'
            },
            {
                type: 'list',
                name: 'role_department',
                message: 'Enter a department for the new role?',
                choices: departments
            },
        ]);
        // Actualizar aquí 'title' en lugar de 'name'
        await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', // Usando 'title' para coincidir con la base de datos
        [response.role_title, response.role_salary, response.role_department]);
        console.log('Role added successfully');
    }
    catch (err) {
        console.error('Error adding role:', err);
    }
    finally {
        await init();
    }
}
async function addEmployee() {
    try {
        // Obtener la lista de roles
        const roleData = await pool.query('SELECT * FROM role');
        const roles = roleData.rows.map((d) => ({ name: d.title, value: d.id }));
        const employeeData = await pool.query('SELECT * FROM employee');
        const employees = employeeData.rows.map((d) => ({ name: `${d.first_name} ${d.last_name}`, value: d.id }));
        employees.push({ name: 'No manager', value: null });
        const response = await inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: "Enter employee's first name:",
                validate: (input) => input.trim() ? true : 'First name cannot be empty.'
            },
            {
                type: 'input',
                name: 'last_name',
                message: "Enter employee's last name:",
                validate: (input) => input.trim() ? true : 'Last name cannot be empty.'
            },
            {
                type: 'list',
                name: 'employee_role',
                message: "Enter employee's role:",
                choices: roles
            },
            {
                type: 'list',
                name: 'employee_manager',
                message: "Enter employee's manager:",
                choices: employees
            },
        ]);
        await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [response.first_name, response.last_name, response.employee_role, response.employee_manager]);
        console.log('Employee added successfully');
    }
    catch (err) {
        console.error('Error adding employee:', err);
    }
    finally {
        await init();
    }
}
async function updateEmployee() {
    try {
        // Obtener la lista de employees
        const employeeData = await pool.query('SELECT * FROM employee');
        const employees = employeeData.rows.map((emp) => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
        }));
        // Obtener la lista de roles
        const roleData = await pool.query('SELECT * FROM role');
        const roles = roleData.rows.map((role) => ({
            name: role.title,
            value: role.id
        }));
        // Preguntar al usuario qué empleado y qué rol actualizar
        const response = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select an employee to update:',
                choices: employees
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select a new role for the employee:',
                choices: roles
            }
        ]);
        // Actualizar el rol del empleado en la base de datos
        await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [response.role_id, response.employee_id]);
        console.log('Employee role updated successfully');
    }
    catch (err) {
        console.error('Error updating employee role:');
    }
    finally {
        await init(); // Volver al menú principal
    }
}
async function quit() {
    console.log('Goodbye :)');
    process.exit();
}
init();
