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
    intentories: Inventory[]
}

type Equipment = {
    name: string,
    weight: number,
    cost: { quantity: number, unit: "gp" | "sp" | "bp" }
}

type Inventory = {
    index: string,
    items: { equipment: string, amount: number }[]
}

const getUserCharacters = (user: string) => {
    return characters.find({ user }).toArray()
}

const getAllCharacters = () => {
    return characters.find().toArray()
}

const removeCharacter = (name: string) => {
    return characters.deleteOne({ name })
}

const createCharacter = (user: string, character: Character) => {
    return characters.insertOne({ ...character, user, inventories: { index: "main", items: [] } })
}

const getEquipmentNames = () => {
    return equipment.find({}, { projection: { _id: false, name: true } }).map(el => el.name).toArray()
}

const getEquipmentData = (name: string) => {
    return equipment.findOne({ name: name }, { projection: { _id: false, name: true, cost: true, weight: true } })
}

const addToInventory = (characterName: string, equipmentName: string, amount: number) => {
    return characters.updateOne({ name: characterName, "inventories.index": "main" },
        {
            $push:
            {
                "inventories.$.items":
                {
                    equipment: equipmentName,
                    amount
                }
            }
        })
}

export { races, getUserCharacters, removeCharacter, createCharacter, Character, getEquipmentNames, getEquipmentData, getAllCharacters, addToInventory }
