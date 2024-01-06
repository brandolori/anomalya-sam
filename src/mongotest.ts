import { getCharactersAwaitingApproval, getCharactersWithoutBackground } from "./characters.js"
import { characters } from "./database.js"

const a = await getCharactersAwaitingApproval()
console.log(a.length)
console.log(a[0])