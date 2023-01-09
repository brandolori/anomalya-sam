import { SlashCommandBuilder } from "discord.js"
import { updateCharacter, userHasCharacter, standardCharacterAutocomplete } from "../characters.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("modificadescrizione")
        .setDescription("Modifica la descrizione di un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il nome del personaggio da modificare")
                .setRequired(true)
                .setAutocomplete(true)),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()
        await standardCharacterAutocomplete(focusedValue, interaction)
    },
    steps: [
        { name: "description", type: "input", prompt: ["Inserisci una descrizione del personaggio"] },
    ],
    callback: async (interaction, data, originalInteraction) => {

        const characterName = originalInteraction.options.getString("personaggio")

        if (!(await userHasCharacter(interaction.user.id, characterName))) {
            await interaction.followUp({ content: `Errore: non esiste il personaggio '${characterName}'`, ephemeral: true })
            return
        }

        await updateCharacter(characterName, { description: data.description[0] })
        interaction.followUp({ content: `${characterName} aggiornato correttamente!`, ephemeral: true })

    }
}
export default command