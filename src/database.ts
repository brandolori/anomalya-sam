import mongo from 'mongodb'
const { MongoClient } = mongo

const uri =
    "mongodb://127.0.0.1:27017"
const client = new MongoClient(uri, { useUnifiedTopology: true })
await client.connect()
const database = client.db('anomalya')
const characters = database.collection('characters')
const equipment = database.collection('equipment')
const campaigns = database.collection('campaigns')
const players = database.collection('players')
const towns = database.collection('towns')

await characters.createIndex({ name: 1, user: 1 })
await equipment.createIndex({ name: 1, index: 1 })
await campaigns.createIndex({ name: 1 })
await players.createIndex({ userId: 1 })
await towns.createIndex({ name: 1 })

console.log("mongo loaded")

export { equipment, characters, campaigns, players, towns }