import { MongoClient } from "mongodb"


// Replace the uri string with your connection string.
const uri =
    "mongodb://127.0.0.1:27017"
const client = new MongoClient(uri)
const database = client.db('test')
const equipment = database.collection('equipment')

console.log(await equipment.countDocuments())
