# Northcoders News API

### Project Summary: 

- This project creates the backend for a news app containing a database of articles, users, comments, etc.

- The accessible endpoints are listed in the following hosted version of the app: 
    - https://news-app-8vge.onrender.com/api


### Set-Up Instructions: 

- Clone repo to local environment

- Run npm install to install required dependencies 

- Create .env files for test database (.env.test) and development database (.env.development) containing the following:
    - 'PGDATABASE=database_name_test'
    - 'PGDATABASE=database_name'
- Add above files to .gitignore file

- To initialise and seed the databases run the following: 
    - npm run setup-dbs
    - npm run seed

### Minimum Version Requirements:
- Node.js: v21.0.0
- PostgreSQL: v14.11