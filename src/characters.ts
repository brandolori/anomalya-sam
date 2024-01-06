import { AutocompleteInteraction, Message, SelectMenuInteraction } from "discord.js"
import fetch from "node-fetch"
import sharp from "sharp"
import { getCampaign, getPlayerCampaigns } from "./campaigns.js"
import { isAdmin } from "./core.js"
import { characters } from "./database.js"
import { EquipmentInInventory } from "./equipment.js"
import { requestChoice } from "./flow.js"

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

export type IndexCharacter = { name: string, user: string }

export type LightCharacter = Omit<Character, "inventory" | "picture">

const getOwnedCharacters = async (userId: string) => {
    const response = await characters.find({ user: userId }, { projection: { _id: false, name: true, user: true } }).toArray()

    return response as unknown as IndexCharacter[]
}

const getReadableCharacters = async (userId: string) => {
    const userCharacters = await getOwnedCharacters(userId)
    const campaignNames = await getPlayerCampaigns(userId)
    const campaigns = await Promise.all(campaignNames.map(async el => await getCampaign(el)))
    const campaignCharacters = campaigns.map(el => el.characters).flat()

    const unique: { [key: string]: IndexCharacter } = {};

    [...userCharacters, ...campaignCharacters].forEach(el => unique[el.name] = el)

    return Object.values(unique)
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
        return readableCharacters.map(el => el.name).includes(characterName)
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

const userCanWriteAutocomplete = async (inputValue: string, interaction: AutocompleteInteraction) => {

    const characters = isAdmin(interaction.user.id)
        ? await getAllCharacters()
        : await getOwnedCharacters(interaction.user.id)

    const filtered = characters
        .map(el => el.name)
        .filter(choice => choice.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 25)
    try {
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )
    } catch (e) {
        console.log(`timeout autocompletamento in ${interaction.commandName}`)
    }
}

const userCanReadAutocomplete = async (inputValue: string, interaction: AutocompleteInteraction) => {

    const characters = isAdmin(interaction.user.id)
        ? await getAllCharacters()
        : await getReadableCharacters(interaction.user.id)

    const filtered = characters
        .map(el => el.name)
        .filter(choice => choice.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 25)
    try {
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )
    } catch (e) {
        console.log(`timeout autocompletamento in ${interaction.commandName}`)
    }
}

const checkCharacterExists = async (name: string) => {
    return (await characters.countDocuments({ name })) > 0
}

const addImageToCharacter = async (message: Message, currentInteraction: SelectMenuInteraction) => {
    const characters = await getOwnedCharacters(message.author.id)

    if (characters.length == 0) {
        const content = { content: `Errore! Non hai mai creato nessun personaggio. Inizia ora con /crea` }

        if (currentInteraction.replied)
            await currentInteraction.followUp(content)
        else
            await currentInteraction.reply(content)
        return
    }

    const { data: characterName, interaction } = await requestChoice(currentInteraction, characters.map(el => el.name), "A quale personaggio aggiornare l'immagine?")

    const res = await fetch(message.attachments.first()!.url)
    const inputBuffer = Buffer.from(await res.arrayBuffer())

    const outputBuffer = await sharp(inputBuffer)
        .resize(360, 360, { fit: 'outside', withoutEnlargement: true })
        .removeAlpha()
        .webp({ quality: 65, effort: 6 })
        .toBuffer()

    await updateCharacter(characterName, { picture: outputBuffer })

    await interaction.followUp({ content: `L'immagine di ${characterName} è stata aggiornata con successo!` })
}


const getCharactersWithoutBackground = async (userId: string) => {
    const promise = isAdmin(userId)
        ? characters.find({ $or: [{ background: null }, { "background.approved": false }] }).toArray()
        : characters.find({ $or: [{ background: null, user: userId }, { "background.approved": false, user: userId }] }).toArray()

    const value = await promise

    return value as unknown as Character[]
}

const getCharactersAwaitingApproval = async () => {
    const value = await characters.find({ "background.approved": false }).toArray()

    return value as unknown as Character[]
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
    userCanWriteCharacter,
    userCanReadCharacter,
    userCanWriteAutocomplete,
    userCanReadAutocomplete,
    getOwnedCharacters,
    getAllCharacters,
    createCharacter,
    getCharacter,
    updateCharacter,
    removeCharacter,
    getLightCharacter,
    checkCharacterExists,
    getReadableCharacters,
    addImageToCharacter,
    getCharactersWithoutBackground,
    getCharactersAwaitingApproval,
    Races
}
