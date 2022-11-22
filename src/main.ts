import { SlashCommandBuilder } from 'discord.js'
import { registerFlows } from './flow.js'

const races = ["nano", "elfo"] as const

type Character = {
    name?: string,
    race?: typeof races[number]
}

let characters: { user: string, character: Character }[] = []

const throwDice = (dice: number) => Math.ceil(Math.random() * dice)

registerFlows(
    {
        builder: new SlashCommandBuilder()
            .setName("crea")
            .setDescription("Crea un nuovo personaggio"),
        steps: [
            { name: "name", type: "input", prompt: "Inserisci il nome del personaggio" },
            { name: "race", type: "choice", options: races, prompt: "Scegli la razza del personaggio" },
        ],
        callback: (interaction, data) => {
            characters.push({
                character: data as Character,
                user: interaction.user.id
            })
        }
    },
    {
        builder: new SlashCommandBuilder()
            .setName("personaggi")
            .setDescription("Mostra tutti i tui personaggi"),
        callback: (interaction) => {
            const userCharacters = characters.filter(el => el.user == interaction.user.id).map(el => el.character)
            const userCharactersString = userCharacters.map(el => `Nome: ${el.name}\nRazza: ${el.race}`).join("\n\n")
            interaction.reply(`Trovati ${userCharacters.length} personaggi:\n\n${userCharactersString}`)
        }
    },
    {
        builder: new SlashCommandBuilder()
            .setName("elimina")
            .setDescription("Elimina un personaggio")
            .addStringOption(option =>
                option.setName("personaggio")
                    .setDescription("Il personaggio da eliminare")
                    .setAutocomplete(true)
                    .setRequired(true)
            ),
        autocomplete: (interaction) => {
            const focusedValue = interaction.options.getFocused()
            const choices = characters.filter(el => el.user == interaction.user.id).map(el => el.character.name)
            const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
            interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            )
        },
        steps: [
            { name: "name", type: "input", prompt: "Conferma il nome del pg" },
        ],
        callback: (interaction, data, originalInteraction) => {
            const originalName = originalInteraction.options.getString("personaggio")
            const confirmName = data.name

            if (!characters.find(el => el.user == interaction.user.id && el.character.name == originalName)) {
                interaction.followUp(`Eliminazione non andata a buon fine: nessun personaggio trovato con questo nome`)
                return
            }

            if (originalName == confirmName) {
                characters = characters
                    .filter(el => !(el.user == interaction.user.id && el.character.name == originalName))

                interaction.followUp(`${originalName} eliminato correttamente`)
            } else {
                interaction.followUp(`Eliminazione non andata a buon fine: il nome inserito non corrisponde`)
            }
        }
    },
    {
        builder: new SlashCommandBuilder()
            .setName("tira")
            .setDescription("Tira uno o più dadi")
            .addStringOption(option =>
                option.setName("dadi")
                    .setDescription("I dadi ta tirare")
                    .setRequired(true))
            .addStringOption(option =>
                option.setName("vantaggio")
                    .setDescription("Tirare con vantaggio o svantaggio?")
                    .setChoices(
                        { name: "vantaggio", value: "advantage" },
                        { name: "svantaggio", value: "disadvantage" }
                    )
            ),
        callback: (interaction) => {

            const dice = interaction.options.getString("dadi")
            const adv = interaction.options.getString("vantaggio")

            const cleanedDice = dice.replace(" ", "").toLowerCase()
            const groups = cleanedDice.replace("-", "+-").split("+")
            let total = 0
            let totalString = ""
            groups.forEach(el => {

                // if it's a modifier
                if (!el.includes("d")) {
                    const modifier = Number.parseInt(el)
                    total += modifier
                    totalString = `${totalString} ${(modifier < 0 ? "-" : "+")} ${Math.abs(modifier)} (mod)`
                } else {

                    const [diceAmountString, diceString] = el.split("d")
                    const diceAmount = Number.parseInt(diceAmountString)
                    const dice = Number.parseInt(diceString)

                    if (dice == 20 && diceAmount == 1 && adv) {
                        const first = throwDice(dice)
                        const second = throwDice(dice)

                        totalString = `${totalString}${total == 0 ? "" : " + "}[${first}, ${second}]`
                        total += adv == "advantage"
                            ? Math.max(first, second)
                            : Math.min(first, second)
                    } else {
                        for (let i = 0; i < diceAmount; i++) {
                            const singleValue = throwDice(dice)
                            totalString = `${totalString}${total == 0 ? "" : " + "}${singleValue} (d${dice})`
                            total += singleValue
                        }
                    }
                }
            })
            interaction.reply(`Hai tirato ${cleanedDice}\nComponenti: ${totalString}\nRisultato: ${total}`)
        }
    })
