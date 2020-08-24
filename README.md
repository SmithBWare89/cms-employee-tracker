# [CMS Employee Tracker](http://www.github.com/SmithBWare89/cms-employee-tracker)

## Description
This package utilizes MySQL to be able to create and access a virtual database to manage data about a company's employees. Users will answer command line prompts generated using the Inquirer node package to allow the user to query the database.

## Table of Contents
* [Installation](#installation)
* [Usage](#usage)
* [License](#license)
* [Languages](#languages)
* [Contributing](#contributing)
* [Collaborator](#collaborators)
* [Tests](#test)
* [Questions](#questions)

## Installation
Install `MySQL` onto your machine (REQUIRED!). Clone the repository to your machine then navigate to the directory in your terminal and run `npm install` from your command line.

## Usage
Once you've installed the node packages you will have to update the `username` and `password` fields to reflect your information for MySQL. If your username is also root then update the password field. From your terminal that's already on the root directory of this project run `npm run sql` then enter your password. Once you've logged into your MySQL then run `source db/schema.sql` to set up the tables for our database. Once that's completed run `source db/seeds.sql` if you would like to pre-populate data to test the database. If not, then open another terminal instance and navigate to the directory of this project with your MySQL still running. In your new terminal input `node index` to run the index.js file. This will prompt you to be begin the process of building your database.

## License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Languages
![Javascript Badge](https://img.shields.io/badge/Language-Javascript-blue)

![Node Badge](https://img.shields.io/badge/Language-Node-blue)

![MySQL Badge](https://img.shields.io/badge/Language-MySQL-blue)

## Contributing
Please reach out to me on Github.

## Collaborators
There were no other contributors to this project.

## Test
None

## Questions
All questions can be directed to [my email](Smithwrestling89@gmail.com).