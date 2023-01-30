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
import { client, isAdmin } from './core.js'
import { ChannelType } from 'discord.js'
import { addImageToCharacter } from './characters.js'
import portafoglio from './commands/portafoglio.js'
import giocatore from './commands/giocatore.js'
import spendi from './commands/spendi.js'
import modificadescrizione from './commands/modificadescrizione.js'
import info from './commands/info.js'
import apricampagna from './commands/apricampagna.js'
import uniscipersonaggio from './commands/uniscipersonaggio.js'
import campagna from './commands/campagna.js'
import campagne from './commands/campagne.js'
import rimuovipersonaggio from './commands/rimuovipersonaggio.js'
import chiudicampagna from './commands/chiudicampagna.js'
import creacittà from './commands/creacittà.js'
import eliminacittà from './commands/eliminacittà.js'
import { addImageToTown } from './towns.js'
import città from './commands/città.js'

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
    spendi,
    info,
    apricampagna,
    uniscipersonaggio,
    campagna,
    campagne,
    rimuovipersonaggio,
    chiudicampagna,
    creacittà,
    eliminacittà,
    città
)

// caricamento immagine personaggio/città
client.on("messageCreate", async message => {
    if (message.channel.type != ChannelType.DM
        || message.attachments.size != 1
        || message.author.bot)
        return

    // non-admin possono solo aggiornare l'immagine ai personaggi
    if (!isAdmin(message.author.id)) {
        await addImageToCharacter(message, message as any)
        return
    }

    const { data: choice, interaction } = await requestChoice(message, ["città", "personaggio"], "A quale entità aggiornare l'immagine?")

    if (choice == "personaggio")
        await addImageToCharacter(message, interaction)
    else if (choice == "città")
        await addImageToTown(message, interaction)
})