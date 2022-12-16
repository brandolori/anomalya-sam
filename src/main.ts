import { registerFlows, requestChoice } from './flow.js'
import crea from './commands/crea.js'
import inventario from './commands/inventario.js'
import personaggi from './commands/personaggi.js'
import elimina from './commands/elimina.js'
import oggetto from './commands/oggetto.js'
import raccogli from './commands/raccogli.js'
import tira from './commands/tira.js'
import getta from './commands/getta.js'
import modificacaratteristica from './commands/modificacaratteristica.js'
import personaggio from './commands/personaggio.js'
import guadagna from './commands/guadagna.js'
import { client } from './core.js'
import { ChannelType } from 'discord.js'
import fetch from 'node-fetch'
import sharp from "sharp"
import { getUserCharacters, updateCharacter } from './data.js'
import portafoglio from './commands/portafoglio.js'
import giocatore from './commands/giocatore.js'
import spendi from './commands/spendi.js'
import modificadescrizione from './commands/modificadescrizione.js'

registerFlows(
    crea,
    personaggi,
    elimina,
    oggetto,
    raccogli,
    tira,
    getta,
    inventario,
    modificacaratteristica,
    modificadescrizione,
    personaggio,
    guadagna,
    portafoglio,
    giocatore,
    spendi
)

// setInterval(() => {
//     const count = client.eventNames().map(el => client.listenerCount(el)).reduce((prev, curr) => prev + curr, 0)
//     console.log("Numero di listener:", count)
// }, 5000)

// caricamento immagine personaggio
client.on("messageCreate", async message => {
    if (message.channel.type != ChannelType.DM
        || message.attachments.size != 1
        || message.author.bot)
        return

    const characters = await getUserCharacters(message.author.id)

    if (characters.length == 0) {
        await message.reply({ content: `Errore! Non hai mai creato nessun personaggio. Inizia ora con /crea` })
        return
    }

    const { data: characterName, interaction } = await requestChoice(message, characters.map(el => el.name), "A quale personaggio aggiornare l'immagine?")

    const res = await fetch(message.attachments.first()!.url)
    const inputBuffer = Buffer.from(await res.arrayBuffer())

    const outputBuffer = await sharp(inputBuffer)
        .resize(360, 360, { fit: 'outside', withoutEnlargement: true })
        .webp({ quality: 65, effort: 6, alphaQuality: 90 })
        .toBuffer()

    await updateCharacter(characterName, { picture: outputBuffer })

    await interaction.followUp({ content: `L'immagine di ${characterName} è stata aggiornata con successo!` })
})

