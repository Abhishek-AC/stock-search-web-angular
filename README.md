# csci571-stock-search-hw8
Homework 8: Ajax, JSON, Responsive Design and Node.js

- Refer the [document](https://github.com/Abhishek-AC/stock-search-web-angular/blob/main/HW8_Description.pdf) for HW requirements

- Refer backend folder to get started with API endpoints in [Node.js](https://nodejs.org/en/)

- Refer frontend folder to get started with components and services written using [Angular](https://angular.io/)

- Both backend and frontend can be deployed using AWS Elastic Beanstalk as Express application. 
    - The frontend-deploy/index.js serves as the express application
        - Create a build of the Angular application as `ng build --prod`
        - Copy and paste the generated dist/ folder inside the frontend-deploy folder 
    - For maintaining loosely coupled environment between frontend and backend, deploy the frontend and backend as separate Elastic Beanstalk applications
    - Refer the [AWS documentation](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs_express.html) to deploy an express application to Elastic Beanstalk