import { registerFlows, requestChoice } from './flow.js'
import crea from './commands/crea.js'
import inventario from './commands/inventario.js'
import personaggi from './commands/personaggi.js'
import elimina from './commands/elimina.js'
import oggetti from './commands/oggetti.js'
import raccogli from './commands/raccogli.js'
import tira from './commands/tira.js'
import getta from './commands/getta.js'
import modificacaratteristiche from './commands/modificacaratteristiche.js'
import personaggio from './commands/personaggio.js'
import { client } from './core.js'
import { ChannelType } from 'discord.js'
import fetch from 'node-fetch'
import sharp from "sharp"
import { getUserCharacters, updateCharacter } from './data.js'

registerFlows(
    crea,
    personaggi,
    elimina,
    oggetti,
    raccogli,
    tira,
    getta,
    inventario,
    modificacaratteristiche,
    personaggio
)

client.on("messageCreate", async message => {
    if (message.channel.type != ChannelType.DM
        || message.attachments.size != 1
        || message.author.bot)
        return

    const characters = await getUserCharacters(message.author.id)

    const { data: characterName, interaction } = await requestChoice(message, characters.map(el => el.name), "A quale personaggio aggiornare l'immagine?")

    const res = await fetch(message.attachments.first().url)
    const inputBuffer = Buffer.from(await res.arrayBuffer())

    const outputBuffer = await sharp(inputBuffer)
        .resize(512, 512, { fit: "inside", withoutEnlargement: true })
        .jpeg()
        .toBuffer()

    await updateCharacter(characterName, { picture: outputBuffer })

    await interaction.followUp({ content: `L'immagine del personaggio è stata aggiornata con successo!`, ephemeral: true })
})

