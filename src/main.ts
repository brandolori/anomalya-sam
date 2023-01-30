import { registerFlows, requestChoice } from './flow.js'
import crea from './commands/characters/crea.js'
import inventario from './commands/equipment/inventario.js'
import personaggi from './commands/characters/personaggi.js'
import elimina from './commands/characters/elimina.js'
import oggetto from './commands/equipment/oggetto.js'
import raccogli from './commands/equipment/raccogli.js'
import tira from './commands/tira.js'
import getta from './commands/equipment/getta.js'
import modificacaratteristica from './commands/characters/modificacaratteristica.js'
import personaggio from './commands/characters/personaggio.js'
import guadagna from './commands/equipment/guadagna.js'
import { client, isAdmin } from './core.js'
import { ChannelType } from 'discord.js'
import { addImageToCharacter } from './characters.js'
import portafoglio from './commands/equipment/portafoglio.js'
import giocatore from './commands/giocatore.js'
import spendi from './commands/equipment/spendi.js'
import modificadescrizione from './commands/characters/modificadescrizione.js'
import info from './commands/info.js'
import apricampagna from './commands/campaigns/apricampagna.js'
import uniscipersonaggio from './commands/campaigns/uniscipersonaggio.js'
import campagna from './commands/campaigns/campagna.js'
import campagne from './commands/campaigns/campagne.js'
import rimuovipersonaggio from './commands/campaigns/rimuovipersonaggio.js'
import chiudicampagna from './commands/campaigns/chiudicampagna.js'
import creacittà from './commands/towns/creacittà.js'
import eliminacittà from './commands/towns/eliminacittà.js'
import { addImageToTown } from './towns.js'
import città from './commands/towns/città.js'

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