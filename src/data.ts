import { APIInteractionGuildMember, GuildMember, User } from "discord.js"
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

const getUserCharacters = async (member: GuildMember) => {

    if (member.roles.cache.has("1046812939774087218"))
        return getAllCharacters()


    const response = await characters.find({ user: member.id }).toArray()

    return response as unknown as Character[]
}

const userHasCharacter = async (member: GuildMember, character: string) => {
    return !!(await getUserCharacters(member)).find(el => el.name == character)
}

const getAllCharacters = async () => {

    const response = await characters.find().toArray()

    return response as unknown as Character[]
}

const removeCharacter = (name: string) => {
    return characters.deleteOne({ name })
}

const createCharacter = (user: string, character: Character) => {
    return characters.insertOne({ ...character, user, inventory: [] })
}

const getEquipmentNames = async () => {

    const response = await equipment.find({}, { projection: { _id: false, name: true } }).map(el => el.name).toArray()

    return response as string[]
}

const getEquipmentData = async (name: string) => {

    const response = await equipment.findOne({ name: name }, { projection: { _id: false, name: true, cost: true, weight: true } })

    return response as unknown as Equipment
}

const addToInventory = async (characterName: string, location: string, equipmentName: string, amount: number) => {

    const currentAmount = (await getCharacterInventory(characterName, location))
        ?.find(el => el.equipment == equipmentName)
        ?.amount ?? 0

    if (currentAmount > 0) {
        return characters.updateOne({ name: characterName, "inventory.equipment": equipmentName },
            {
                $set:
                {
                    "inventory.$":
                    {
                        equipment: equipmentName,
                        location,
                        amount: currentAmount + amount
                    }
                }
            })
    }
    else {
        return characters.updateOne({ name: characterName },
            {
                $push:
                {
                    inventory:
                    {
                        equipment: equipmentName,
                        location,
                        amount: amount
                    }
                }
            })
    }
}

const removeFromInventory = async (characterName: string, location: string, equipmentName: string, amountToRemove: number) => {

    const currentAmount = (await getCharacterInventory(characterName, location))
        ?.find(el => el.equipment == equipmentName)
        ?.amount ?? 0

    if (currentAmount == 0)
        throw new Error(`'${characterName}' non ha ${equipmentName}`)

    if (currentAmount > amountToRemove) {
        return characters.updateOne({ name: characterName, "inventory.equipment": equipmentName },
            {
                $set:
                {
                    "inventory.$":
                    {
                        equipment: equipmentName,
                        location,
                        amount: currentAmount - amountToRemove
                    }
                }
            })
    }
    else {
        return characters.updateOne({ name: characterName },
            {
                $pull:
                {
                    inventory:
                    {
                        equipment: equipmentName,
                        location,
                    }
                }
            })
    }
}

const checkCharacterExists = async (name: string) => {
    return (await characters.countDocuments({ name })) > 0
}

const checkEquipmentExists = async (name: string) => {
    return (await equipment.countDocuments({ name })) > 0
}

const getCharacterInventory = async (character: string, location: string) => {
    const response = (await characters.findOne({ name: character, "inventory.location": location }, { projection: { inventory: true } })) as unknown as Character
    return response?.inventory?.filter(el => el.location == location) ?? []
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
    getCharacterInventory,
    checkCharacterExists,
    checkEquipmentExists,
    userHasCharacter,
    removeFromInventory
}
