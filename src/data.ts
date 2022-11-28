import { MongoClient } from "mongodb"

const uri =
    "mongodb://127.0.0.1:27017"
const client = new MongoClient(uri)
const database = client.db('test')
const equipment = database.collection('equipment')
const characters = database.collection('characters')

const races = ["nano", "elfo"] as const

type Character = {
    name: string,
    race: typeof races,
}

const getUserCharacters = (user: string) => {
    return characters.find({ user }).toArray()
}

const removeCharacter = (user: string, name: string) => {
    return characters.deleteOne({ user, name })
}

const createCharacter = (user: string, character: Character) => {
    return characters.insertOne({ ...character, user })
}

const getEquipmentNames = (limit: number) => {
    return equipment.find({}, { projection: { _id: false, name: true }, limit: limit }).toArray()
}

const getEquipmentData = (name: string) => {
    return equipment.findOne({ name: name }, { projection: { _id: false, name: true, cost: true, weight: true } })
}

export { races, getUserCharacters, removeCharacter, createCharacter, Character, getEquipmentNames, getEquipmentData }
