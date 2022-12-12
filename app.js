const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Database = require('./Database');

const db = new Database();
db.connect();

const app = express();
app.set('views', path.resolve(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('static'));
