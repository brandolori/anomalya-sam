import { Message, SelectMenuInteraction } from "discord.js"
import fetch from "node-fetch"
import sharp from "sharp"
import { towns } from "./database.js"
import { requestChoice } from "./flow.js"

type Town = {
    name: string
    description: string,
    picture?: any
}

const createTown = async (name: string, description: string) => {
    if ((await towns.countDocuments({ name })) > 0)
        throw new Error(`Città '${name}' già esistente! Prova con un'altro nome`)

    return towns.insertOne({ name, description })
}

const updateTown = async (name: string, character: Partial<Town>) => {
    return towns.updateOne({ name }, { $set: { ...character } })
}

const deleteTown = (name: string) => {
    return towns.deleteOne({ name })
}

const getTown = async (name: string) => {
    const response = await towns.findOne({ name }, { projection: { _id: false } })
    return response as unknown as Town
}

const getAllTownNames = async () => {
    const response = await towns.find({}, { projection: { _id: false, name: true } }).toArray()

    const townNames: string[] = response?.map(el => el.name) ?? []

    return townNames
}

const addImageToTown = async (message: Message, currentInteraction: SelectMenuInteraction) => {
    const towns = await getAllTownNames()

    if (towns.length == 0) {
        const content = { content: `Errore! Non è mai stata creata nessuna città. Inizia con /creacittà` }

        if (currentInteraction.replied)
            await currentInteraction.followUp(content)
        else
            await currentInteraction.reply(content)
        return
    }

    const { data: townName, interaction } = await requestChoice(currentInteraction, towns, "A quale città aggiornare l'immagine?")

    const res = await fetch(message.attachments.first()!.url)
    const inputBuffer = Buffer.from(await res.arrayBuffer())

    const outputBuffer = await sharp(inputBuffer)
        .resize(960, 960, { fit: 'inside', withoutEnlargement: true })
        .removeAlpha()
        .webp({ quality: 65, effort: 6 })
        .toBuffer()

    await updateTown(townName, { picture: outputBuffer })

    await interaction.followUp({ content: `L'immagine di ${townName} è stata aggiornata con successo!` })
}

export {
    createTown,
    updateTown,
    deleteTown,
    getTown,
    getAllTownNames,
    addImageToTown
}
