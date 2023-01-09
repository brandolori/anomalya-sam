import { AutocompleteInteraction } from "discord.js"
import { getCampaign, getPlayerCampaigns } from "./campaigns.js"
import { isAdmin } from "./core.js"
import { characters, Character, IndexCharacter, LightCharacter } from "./database.js"

const getUserCharacters = async (userId: string) => {
    const response = await characters.find({ user: userId }, { projection: { _id: false, name: true, user: true } }).toArray()

    return response as unknown as IndexCharacter[]
}

const getReadableCharacters = async (userId: string) => {
    const userCharacters = (await getUserCharacters(userId)).map(el => el.name)
    const campaignNames = await getPlayerCampaigns(userId)
    const campaigns = await Promise.all(campaignNames.map(async el => await getCampaign(el)))
    const campaignCharacters = campaigns.map(el => el.characters).flat().map(el => el.name)

    const characters = new Set([...campaignCharacters, ...userCharacters])

    return [...characters]
}

const getAllCharacters = async () => {
    const response = await characters.find({}, { projection: { _id: false, name: true, user: true } }).toArray()

    return response as unknown as IndexCharacter[]
}

const getCharacter = async (characterName: string) => {
    return (await characters.findOne({ name: characterName })) as unknown as Character
}

const getLightCharacter = async (characterName: string) => {
    const response = await characters.findOne(
        { name: characterName },
        {
            projection: {
                _id: false,
                name: true,
                user: true,
                race: true,
                strength: true,
                dexterity: true,
                constitution: true,
                intelligence: true,
                winsdom: true,
                charisma: true,
            }
        })
    return response as unknown as LightCharacter
}

const userCanWriteCharacter = async (userId: string, characterName: string) => {
    if (isAdmin(userId))
        return (await characters.countDocuments({ name: characterName })) > 0
    else
        return (await characters.countDocuments({ name: characterName, user: userId })) > 0
}

const userCanReadCharacter = async (userId: string, characterName: string) => {
    if (isAdmin(userId))
        return (await characters.countDocuments({ name: characterName })) > 0
    else {
        const readableCharacters = await getReadableCharacters(userId)
        return readableCharacters.includes(characterName)
    }
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

const standardCharacterAutocomplete = async (inputValue: string, interaction: AutocompleteInteraction) => {

    const characters = isAdmin(interaction.user.id)
        ? await getAllCharacters()
        : await getUserCharacters(interaction.user.id)

    const choices = characters.map(el => el.name)
    const filtered = choices.filter(choice => choice.toLowerCase().includes(inputValue.toLowerCase())).slice(0, 25)
    try {
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )
    } catch (e) { }
}


const checkCharacterExists = async (name: string) => {
    return (await characters.countDocuments({ name })) > 0
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

export {
    Character,
    userCanWriteCharacter as userHasCharacter,
    getUserCharacters,
    getAllCharacters,
    getCharacter,
    removeCharacter,
    createCharacter,
    updateCharacter,
    standardCharacterAutocomplete,
    getLightCharacter,
    checkCharacterExists,
    getReadableCharacters,
    userCanReadCharacter,
    Races
}
