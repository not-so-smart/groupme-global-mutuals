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

app.get('/', async (request, response) => {
    let table = 'Please load some data first.'
    const { group1, group2 } = request.query
    if (!(group1 && group2)) {
        return response.render('home', { table })
    }

    const members1 = await db.getMembersFromGroup(group1)
    const members2 = await db.getMembersFromGroup(group2)

    const results = []
    members1.forEach(member1 => {
        const member2 = members2.find(member2 => member1.userID == member2.userID)
        if (member2) results.push({
            user: {
                id: member1.userID,
                name: member1.userName,
                avatar: member1.userAvatar || 'https://cdn.groupme.com/assets/avatars/default-user.large.png?version=7.4.2-20221129.2'
            },
            member1, member2
        })
    })
    // response.end(JSON.stringify(results, null, '\t'))

    table = '<table border="1"><tr><th>ID</th><th>Name</th><th>Avatar</th></tr>' +
        results
            .map(result => `<tr><td>${result.user.id}</td><td>${result.user.name}</td><td><img src="${result.user.avatar}" height="100" width="100"></td></tr>`)
            .join('\n')
        + '</table>'
    response.render('home', { table })
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
    response.end(JSON.stringify(groupArray, null, '\t'))
    // response.render('success')
})

// work-in-progress deletion endpoint
app.post('/delete', (request, response) =>
    db.clear().then(results => response.end(JSON.stringify(results)))
)

// temporary testing endpoint
app.get('/test', async (request, response) => {
    const result = await db.findMutualMembers('59394515', '53263097')
    response.end(JSON.stringify(result, null, '\t'))
})

app.listen(5000)