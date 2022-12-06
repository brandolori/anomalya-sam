import { SlashCommandBuilder } from "discord.js"
import { removeCharacter, standardCharacterAutocomplete, userHasCharacter } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("elimina")
        .setDescription("Elimina un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il personaggio da eliminare")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()
        await standardCharacterAutocomplete(focusedValue, interaction)
    },
    steps: [
        { name: "name", type: "input", prompt: ["Conferma il nome del pg"] },
    ],
    callback: async (interaction, data, originalInteraction) => {
        const originalName = originalInteraction.options.getString("personaggio")
        const confirmName = data.name

        if (!(await userHasCharacter(interaction.user.id, originalName))) {
            await interaction.followUp({ content: `Eliminazione non andata a buon fine: nessun personaggio trovato con questo nome`, ephemeral: true })
            return
        }
        if (originalName == confirmName) {
            await removeCharacter(originalName)

            interaction.followUp({ content: `${originalName} eliminato correttamente`, ephemeral: true })
        } else {
            interaction.followUp({ content: `Eliminazione non andata a buon fine: il nome inserito non corrisponde`, ephemeral: true })
        }
    }
}
export default command