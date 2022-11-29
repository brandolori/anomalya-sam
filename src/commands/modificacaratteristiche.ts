import { SlashCommandBuilder } from "discord.js"
import { updateCharacter, getUserCharacters, userHasCharacter } from "../data.js"
import { Command } from "../flow.js"

const abilityChoices = Array.from(Array(20).keys())
    .reverse()
    .map(el => el + 1)
    .map(el => ({ name: el.toString(), value: el }))

const abilities = [
    { name: "Forza", value: "strength" },
    { name: "Destrezza", value: "dexterity" },
    { name: "Costituzione", value: "constitution" },
    { name: "Intelligenza", value: "intelligence" },
    { name: "Saggezza", value: "winsdom" },
    { name: "Carisma", value: "charisma" },
]

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("modificacaratteristica")
        .setDescription("Modifica una caratteristica di un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il nome del personaggio da modificare")
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName("caratteristica")
                .setDescription("la caratteristica da modificare")
                .setRequired(true)
                .setChoices(...abilities))
        .addNumberOption(option =>
            option.setName("punteggio")
                .setDescription("il nuovo punteggio")
                .setRequired(true)
                .setChoices(...abilityChoices)),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()
        const choices = (await getUserCharacters(interaction.user.id)).map(el => el.name)
        const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
        interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )
    },
    callback: async (interaction, _, originalInteraction) => {

        const characterName = originalInteraction.options.getString("personaggio")
        const caratteristica = originalInteraction.options.getString("caratteristica")
        const punteggio = originalInteraction.options.getNumber("punteggio")

        if (!(await userHasCharacter(interaction.user.id, characterName))) {
            await interaction.reply({ content: `Errore: non esiste il personaggio '${characterName}'`, ephemeral: true })
            return
        }

        await updateCharacter(characterName, { [caratteristica]: punteggio })
        interaction.reply({ content: `${characterName} aggiornato correttamente!`, ephemeral: true })

    }
}
export default command