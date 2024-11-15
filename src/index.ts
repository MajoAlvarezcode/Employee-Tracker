import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';
await connectToDb();

const initQ = [
    {
        type: 'list',
        name: 'selection',
        message: 'What would you like to do?',
        choices: [
            'View all courses',
            'View a course',
            'quit'
        ]
    }
]

async function init() {
    const { selection } = await inquirer.prompt(initQ)

    switch (selection) {
        case 'View all courses':
            await viewCourses()
            break;
        case 'View a course':
            await viewCourse()
            break;
        case 'quit':
            await quit()
            break;

        default:
            break;
    }

}

async function viewCourses() {
    const result = await pool.query('SELECT * FROM course_names;');
    console.table(result.rows)
    await init()
}

async function viewCourse() {
    const result = await pool.query('SELECT id AS value, name FROM course_names;');
    const { id } = await inquirer.prompt([
        {
            type: 'list',
            name: 'id',
            message: 'Which course would you like to view?',
            choices: result.rows
        }
    ])
    const finalResult = await pool.query('SELECT * FROM course_names WHERE id = $1;', [id]);
    console.table(finalResult.rows)
    await init()
}

async function quit() {
    console.log('Goodbye :)');
    process.exit();
}

init()
