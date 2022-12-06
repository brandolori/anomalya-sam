import { AutocompleteInteraction, CacheType } from "discord.js"
import { MongoClient } from "mongodb"
import { isAdmin } from "./core.js"

const uri =
    "mongodb://127.0.0.1:27017"
const client = new MongoClient(uri)
const database = client.db('anomalya')
const equipment = database.collection('equipment')
const characters = database.collection('characters')

type Character = {
    name: string,
    race: string,
    strength: number,
    dexterity: number,
    constitution: number,
    intelligence: number,
    winsdom: number,
    charisma: number,
    inventory: EquipmentInInventory[]
    user: string,
    picture: any
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

type LightCharacter = { name: string, user: string }

const getUserCharacters = async (userId: string) => {
    const response = await characters.find({ user: userId }, { projection: { _id: false, name: true, user: true } }).toArray()

    return response as unknown as LightCharacter[]
}

const getAllCharacters = async () => {
    const response = await characters.find({}, { projection: { _id: false, name: true, user: true } }).toArray()

    return response as unknown as LightCharacter[]
}

const getCharacter = async (characterName: string) => {
    return (await characters.findOne({ name: characterName })) as unknown as Character
}

const userHasCharacter = async (userId: string, characterName: string) => {
    if (await isAdmin(userId))
        return (await characters.countDocuments({ name: characterName })) > 0
    else
        return (await characters.countDocuments({ name: characterName, user: userId })) > 0
}

const removeCharacter = async (name: string) => {
    return characters.deleteOne({ name })
}

const createCharacter = async (character: Partial<Character>) => {
    if ((await characters.countDocuments({ name: character.name })) > 0)
        throw new Error(`Personaggio '${character.name}' già esistente! Prova con un'altro nome`)

    return characters.insertOne({ ...character })
}

const updateCharacter = async (name: string, character: Partial<Character>) => {
    return characters.updateOne({ name }, { $set: { ...character } })
}

const getEquipmentNames = async () => {
    const response = await equipment.find({}, { projection: { _id: false, name: true } }).map(el => el.name).toArray()

    return response as string[]
}

const getEquipmentData = async (name: string) => {
    const response = await equipment.findOne({ name: name }, { projection: { _id: false, name: true, cost: true, weight: true } })

    return response as unknown as Equipment
}

const equipmentIndex = async (equipmentName: string) => {
    const { index } = await equipment.findOne({ name: equipmentName })
    return index
}

const addToInventory = async (characterName: string, location: string, equipmentIndex: string, amount: number) => {
    const currentAmount = (await getCharacterInventory(characterName, location))
        ?.find(el => el.equipment == equipmentIndex)
        ?.amount ?? 0

    if (currentAmount > 0) {
        return characters.updateOne({ name: characterName, "inventory.equipment": equipmentIndex },
            {
                $set:
                {
                    "inventory.$":
                    {
                        equipment: equipmentIndex,
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
                        equipment: equipmentIndex,
                        location,
                        amount: amount
                    }
                }
            })
    }
}

const removeFromInventory = async (characterName: string, location: string, equipmentIndex: string, amountToRemove: number) => {

    const currentAmount = (await getCharacterInventory(characterName, location))
        ?.find(el => el.equipment == equipmentIndex)
        ?.amount ?? 0

    if (currentAmount == 0)
        throw new Error(`notpresent`)

    if (currentAmount > amountToRemove) {
        return characters.updateOne({ name: characterName, "inventory.equipment": equipmentIndex },
            {
                $set:
                {
                    "inventory.$":
                    {
                        equipment: equipmentIndex,
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
                        equipment: equipmentIndex,
                        location,
                    }
                }
            })
    }
}

const removeCoins = async (characterName: string, location: string, equipmentIndex: string, amountToRemove: number) => {

    const currentAmount = (await getCharacterWallet(characterName, location))
        ?.find(el => el.equipment == equipmentIndex)
        ?.amount ?? 0

    if (currentAmount < amountToRemove)
        throw new Error(`notenough`)

    if (currentAmount > amountToRemove) {
        return characters.updateOne({ name: characterName, "inventory.equipment": equipmentIndex },
            {
                $set:
                {
                    "inventory.$":
                    {
                        equipment: equipmentIndex,
                        location,
                        amount: currentAmount - amountToRemove
                    }
                }
            })
    }
    else {
        // if the wallet has the exact number of coins
        return characters.updateOne({ name: characterName },
            {
                $pull:
                {
                    inventory:
                    {
                        equipment: equipmentIndex,
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

const Money = ["gp", "sp", "bp"]

const getCharacterInventory = async (character: string, location: string) => {
    const response = (await characters.findOne({ name: character, "inventory.location": location }, { projection: { inventory: true } })) as unknown as Character
    return response?.inventory?.filter(el => el.location == location).filter(el => !Money.includes(el.equipment)) ?? []
}

const getCharacterWallet = async (character: string, location: string) => {
    const response = (await characters.findOne({ name: character, "inventory.location": location }, { projection: { inventory: true } })) as unknown as Character
    return response?.inventory?.filter(el => el.location == location).filter(el => Money.includes(el.equipment)) ?? []
}

const getExpandedCharacterInventory = async (character: string, location: string) => {
    // query: mostra nell'inventario solo oggetti della location passata e ignorando gp, sp e bp
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
                        cond: {
                            $and: [
                                { $eq: ["$$inventory.location", location] },
                                ...Money.map(el => ({ $ne: ["$$inventory.equipment", el] }))
                            ]
                        }
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

const Races = [
    "Umano",
    "Nano",
    "Elfo",
    "Dragonide",
    "Tiefling",
    "Gnomo",
    "Mezzorco",
    "Mezzelfo",
]

const standardCharacterAutocomplete = async (inputValue: string, interaction: AutocompleteInteraction) => {

    const characters = await isAdmin(interaction.user.id)
        ? await getAllCharacters()
        : await getUserCharacters(interaction.user.id)

    const choices = characters.map(el => el.name)
    const filtered = choices.filter(choice => choice.toLowerCase().includes(inputValue.toLowerCase()))
    try {
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )
    } catch (e) { }
}

export {
    Character,
    userHasCharacter,
    getUserCharacters,
    getAllCharacters,
    getCharacter,
    removeCharacter,
    createCharacter,
    updateCharacter,
    getEquipmentNames,
    getEquipmentData,
    equipmentIndex,
    addToInventory,
    getCharacterInventory,
    checkCharacterExists,
    checkEquipmentExists,
    removeFromInventory,
    getExpandedCharacterInventory,
    Races,
    Money,
    getCharacterWallet,
    standardCharacterAutocomplete,
    removeCoins
}
