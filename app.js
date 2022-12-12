const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Database = require('./Database');
const { Client } = require('node-groupme')

const db = new Database();
db.connect();

const app = express();
app.set('views', path.resolve(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('static'));

app.get('/', (request, response) => {
    response.render('home')
})

app.get('/login', (request, response) => {
    response.render('login')
})

app.post('/login', async (request, response) => {
    const { token } = request.body
    const client = new Client(token)
    await client.login()
    const groups = await client.groups.fetch()
    const arr = client.groups.cache.map(group => group.name)
    response.end(JSON.stringify(arr, null, '\t'))
})

app.listen(5000)