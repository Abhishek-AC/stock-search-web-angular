const path = require('path');

const express = require('express');   
const app = express();

const port = process.env.PORT || 3000;   


//Set the base path to the angular-test dist folder
app.use(express.static(path.join(__dirname, 'dist/frontend')));

//Any routes will be redirected to the angular app
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/frontend/index.html'));
});

//Starting server on port 8081
app.listen(port, () => {
    console.log('Front End Server started!');
});