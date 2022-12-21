import pkg from 'mongodb'
const { MongoClient } = pkg
export type Character = {
    name: string,
    race: string,
    strength: number,
    dexterity: number,
    constitution: number,
    intelligence: number,
    winsdom: number,
    charisma: number,
    description: string,
    inventory: EquipmentInInventory[]
    user: string,
    picture: any
}
export type Equipment = {
    name: string,
    index: string,
    weight: number,
    cost: { quantity: number, unit: "gp" | "sp" | "bp" }
}
export type EquipmentInInventory = {
    equipment: string,
    location: string,
    amount: number
}

export type IndexCharacter = { name: string, user: string }

export type LightCharacter = Omit<Character, "inventory" | "picture">

const uri =
    "mongodb://127.0.0.1:27017"
const client = new MongoClient(uri, { useUnifiedTopology: true })
await client.connect()
const database = client.db('anomalya')
const equipment = database.collection('equipment')
const characters = database.collection('characters')
const campaigns = database.collection('campaigns')
const players = database.collection('players')

await characters.createIndex({ name: 1, user: 1 })
await equipment.createIndex({ name: 1, index: 1 })
await campaigns.createIndex({ name: 1 })

export { equipment, characters, campaigns, players }