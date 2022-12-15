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
    groups.forEach(async group => {
        const memberArray = group.members.cache.map(member => {
            return {
                _id: member.memberID,
                nickname: member.nickname,
                avatar: member.image_url,
                roles: member.roles,
                muted: member.muted,
                groupID: member.group.id,
                userID: member.user.id,
                userName: member.user.name,
                userAvatar: member.user.avatar,
            }
        })
        const result = await db.insertMembers(memberArray)
    })
    const groupArray = client.groups.cache.map(group => {
        return {
            _id: group.id,
            name: group.name,
            memberCount: group.members.cache.size,
            image: group.imageURL,
        }
    })
    const result = await db.insertGroups(groupArray)
    // response.end(JSON.stringify(groupArray, null, '\t'))
    response.render('success')
})

app.post('/delete', (request, response) =>
    db.clear().then(results => response.end(JSON.stringify(results)))
)

app.listen(5000)