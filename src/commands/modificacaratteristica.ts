import { SlashCommandBuilder } from "discord.js"
import { updateCharacter, userCanWriteCharacter, userCanWriteAutocomplete } from "../characters.js"
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
        await userCanWriteAutocomplete(focusedValue, interaction)
    },
    callback: async (interaction, _, originalInteraction) => {

        await interaction.deferReply({ ephemeral: true })

        const characterName = originalInteraction.options.getString("personaggio")
        const ability = originalInteraction.options.getString("caratteristica")
        const score = originalInteraction.options.getNumber("punteggio")

        if (!(await userCanWriteCharacter(interaction.user.id, characterName))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${characterName}'` })
            return
        }

        await updateCharacter(characterName, { [ability]: score })
        interaction.editReply({ content: `${characterName} aggiornato correttamente!` })

    }
}
export default command