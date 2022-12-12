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
    createApplicant(name, email, gpa, info) {
        return this.coll.insertOne({ name, email, gpa, info })
    }
    getApplicantByEmail(email) {
        return this.coll.findOne({ email })
    }
    getApplicantsByMinGpa(gpa) {
        return this.coll.find({ gpa: { $gte: gpa } }).toArray()
    }
    async deleteAllApplicants() {
        return (await this.coll.deleteMany({})).deletedCount
    }
}

module.exports = Database