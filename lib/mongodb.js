import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URL) {
    throw new Error("Invalid/Missing env variable: MONGODB_URL")
}

const uri = process.env.MONGODB_URL
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}

let client = null
let clientPromise = null

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options)
        global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
} else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
}

export default clientPromise;