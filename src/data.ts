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
    inventory: EquipmentInInventory[]
}

type Equipment = {
    name: string,
    weight: number,
    cost: { quantity: number, unit: "gp" | "sp" | "bp" }
}

type EquipmentInInventory = {
    equipment: string,
    location: string,
    amount: number
}

const getUserCharacters = async (user: string) => {

    const response = await characters.find({ user }).toArray()

    return response as unknown as Character[]
}

const getAllCharacters = async () => {

    const response = await characters.find().toArray()

    return response as unknown as Character[]
}

const removeCharacter = (name: string) => {
    return characters.deleteOne({ name })
}

const createCharacter = (user: string, character: Character) => {
    return characters.insertOne({ ...character, user, inventories: { index: "main", items: [] } })
}

const getEquipmentNames = async () => {

    const response = await equipment.find({}, { projection: { _id: false, name: true } }).map(el => el.name).toArray()

    return response as string[]
}

const getEquipmentData = async (name: string) => {

    const response = await equipment.findOne({ name: name }, { projection: { _id: false, name: true, cost: true, weight: true } })

    return response as unknown as Equipment
}

const addToInventory = (characterName: string, location: string, equipmentName: string, amount: number) => {
    return characters.updateOne({ name: characterName },
        {
            $push:
            {
                inventory:
                {
                    equipment: equipmentName,
                    location,
                    amount
                }
            }
        })
}

const getCharacterInventory = async (character: string, location: string) => {
    const response = (await characters.findOne({ name: character, "inventory.location": location }, { projection: { inventory: true } })) as unknown as Character

    return response.inventory.filter(el => el.location == location)
}

export {
    races,
    getUserCharacters,
    removeCharacter,
    createCharacter,
    Character,
    getEquipmentNames,
    getEquipmentData,
    getAllCharacters,
    addToInventory,
    getCharacterInventory
}
