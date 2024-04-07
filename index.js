const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("express-async-errors");
require("dotenv").config();
const passport = require('passport');
require('./passport-config')(passport);

const receiver = require("./routes/receiver");
const receiver_test = require("./routes/receiver_test");


// app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


//verify upi 
app.use('/superset',receiver);
app.use('/superset_test',receiver_test);






const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Kenya EMR 3.x Data Receiver App started. Listening on Port: ${PORT}`)
);
