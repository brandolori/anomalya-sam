import { registerFlows } from './flow.js'
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
