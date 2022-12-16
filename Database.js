require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb')

const { MONGO_DB_USERNAME: user, MONGO_DB_PASSWORD: pass, MONGO_DB_NAME: db } = process.env

class Database {
    constructor() {
        const uri = `mongodb+srv://${user}:${pass}@cluster0.095x1re.mongodb.net/?retryWrites=true&w=majority`
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
        this.groups = this.client.db(db).collection('groups')
        this.members = this.client.db(db).collection('members')
    }
    connect() {
        return this.client.connect()
    }
    close() {
        return this.client.close()
    }
    insertGroups(arrayOfGroups) {
        return this.groups.insertMany(arrayOfGroups)
    }
    insertMembers(arrayOfMembers) {
        return this.members.insertMany(arrayOfMembers)
    }
    getMembersFromGroup(groupID) {
        return this.members.find({ groupID }).toArray()
    }
    getApplicantByEmail(email) {
        return this.coll.findOne({ email })
    }
    findMutualMembers(group1, group2) {
        return this.members.aggregate([
            {
                $match: {
                    $or: [
                        {
                            groupID: group1
                        },
                        {
                            groupID: group2
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        'uID': '$userID',
                        'uName': '$userName',
                        'uAvatar': '$userAvatar'
                    },
                    groupCount: { $sum: 1 }
                }
            },
            {
                $match: {
                    groupCount: 2
                }
            },
            {
                $project: {
                    _id: 0,
                    userID: '$_id.uID',
                    userName: '$_id.uName',
                    userAvatar: '$_id.uAvatar'
                }
            }
        ]).toArray()
    }

    /*
    Assuming groupid attribute is an array?

        db.find({
            $and: [
                {
                    groupID : group1
                },
                {
                    groupID : group2
                }
            ]
        })
    */
    compareMembers(group1, group2) {
        return this.coll.find({ $and: [{ groupID: group1 }, { groupID: group2 }] });
    }
    async clear() {
        const groupsDeleted = (await this.groups.deleteMany({})).deletedCount
        const membersDeleted = (await this.members.deleteMany({})).deletedCount
        return {
            groups: groupsDeleted,
            members: membersDeleted
        }
    }
}

module.exports = Database