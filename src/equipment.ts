import { Character } from "./characters.js"
import { characters, equipment } from "./database.js"

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

const getEquipmentNames = async () => {
    const response = await equipment.find({}, { projection: { _id: false, name: true } }).map(el => el.name).toArray()

    return response as string[]
}

const getEquipmentData = async (name: string) => {
    const response = await equipment.findOne({ name: name }, { projection: { _id: false, name: true, cost: true, weight: true } })

    return response as unknown as Equipment
}

const getEquipmentIndex = async (equipmentName: string) => {
    const response = await equipment.findOne({ name: equipmentName }, { projection: { _id: false, index: true } })
    return response?.index
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

const addCoins = async (characterName: string, location: string, equipmentIndex: string, amount: number) => {

    const currentAmount = (await getCharacterWallet(characterName, location))
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

const checkEquipmentExists = async (name: string) => {
    return (await equipment.countDocuments({ name })) > 0
}

const Money = ["gp", "sp", "bp"]

const getCharacterInventory = async (character: string, location: string) => {
    const response = (await characters.findOne({ name: character }, { projection: { _id: false, inventory: true } })) as unknown as Character
    return response?.inventory
        ?.filter(el => el.location == location)
        ?.filter(el => !Money.includes(el.equipment)) ?? []
}

const getCharacterWallet = async (character: string, location: string) => {
    const response = (await characters.findOne({ name: character }, { projection: { _id: false, inventory: true } })) as unknown as Character
    return response?.inventory
        ?.filter(el => el.location == location)
        ?.filter(el => Money.includes(el.equipment)) ?? []
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
            $unwind: "$inventory"
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

    const inventory = aggregation.map(el => ({ ...el.inventory, ...el.equipmentData[0] }))

    return inventory as (Equipment & EquipmentInInventory)[]
}

export {
    getEquipmentNames,
    getEquipmentData,
    getEquipmentIndex,
    addToInventory,
    getCharacterInventory,
    checkEquipmentExists,
    removeFromInventory,
    getExpandedCharacterInventory,
    Money,
    getCharacterWallet,
    removeCoins,
    addCoins,
}
