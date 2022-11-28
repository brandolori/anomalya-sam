import { GuildMember } from "discord.js"
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
    strenght: number,
    // dexterity: number,
    // constitution: number,
    // intelligence: number,
    // winsdom: number,
    // charisma: number,
    inventory: EquipmentInInventory[]
}

type Equipment = {
    name: string,
    index: string,
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
    return characters.insertOne({ ...character, user })
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

    const { index } = await equipment.findOne({ name: equipmentName })

    const currentAmount = (await getCharacterInventory(characterName, location))
        ?.find(el => el.equipment == index)
        ?.amount ?? 0

    if (currentAmount > 0) {
        return characters.updateOne({ name: characterName, "inventory.equipment": index },
            {
                $set:
                {
                    "inventory.$":
                    {
                        equipment: index,
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
                        equipment: index,
                        location,
                        amount: amount
                    }
                }
            })
    }
}

const removeFromInventory = async (characterName: string, location: string, equipmentName: string, amountToRemove: number) => {

    const { index } = await equipment.findOne({ name: equipmentName })

    const currentAmount = (await getCharacterInventory(characterName, location))
        ?.find(el => el.equipment == index)
        ?.amount ?? 0

    if (currentAmount == 0)
        throw new Error(`'${characterName}' non ha ${equipmentName}`)

    if (currentAmount > amountToRemove) {
        return characters.updateOne({ name: characterName, "inventory.equipment": index },
            {
                $set:
                {
                    "inventory.$":
                    {
                        equipment: index,
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
                        equipment: index,
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

const getExpandedCharacterInventory = async (character: string, location: string) => {

    const aggregation = await characters.aggregate([
        {
            $match: {
                name: character
            }
        },
        {
            $project: {
                inventory: {
                    $filter: {
                        input: "$inventory",
                        as: "inventory",
                        cond: { $eq: ["$$inventory.location", location] }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "equipment",
                localField: "inventory.equipment",
                foreignField: "index",
                as: "equipmentData"
            }
        },
        {
            $project: {
                _id: false,
                inventory: true,
                equipmentData: true
            }
        }
    ]).toArray()

    const inventory = aggregation[0]

    return inventory.inventory.map((el, i) => ({ ...el, ...inventory.equipmentData[i] })) as (Equipment & EquipmentInInventory)[]
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
    removeFromInventory,
    getExpandedCharacterInventory
}
