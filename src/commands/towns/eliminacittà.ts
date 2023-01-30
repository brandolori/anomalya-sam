import { SlashCommandBuilder } from "discord.js"
import { isAdmin } from "../../core.js"
import { Command } from "../../flow.js"
import { createTown, deleteTown, getAllTownNames, getTown } from "../../towns.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("eliminacittà")
        .setDescription("Elimina una città")
        .addStringOption(option =>
            option.setName("nome")
                .setDescription("Il nome della città")
                .setRequired(true)
                .setAutocomplete(true)),
    autocomplete: async (interaction) => {
        if (!isAdmin(interaction.user.id)) {
            await interaction.respond([])
            return
        }

        const focusedValue = interaction.options.getFocused()
        try {
            const choices = await getAllTownNames()
            const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            )
        } catch (e) {
            console.log(`timeout autocompletamento in ${interaction.commandName}`)
        }
    },
    steps: [
        { name: "name", type: "input", prompt: ["Conferma il nome della città"] },
    ],
    adminOnly: true,
    callback: async (interaction, data, originalInteraction) => {

        const townName = originalInteraction.options.getString("nome")
        const confirmName = data.name

        const town = await getTown(townName)

        if (!town) {
            await interaction.followUp({ content: `Errore! La città '${townName}' non esiste`, ephemeral: true })
            return
        }

        if (townName != confirmName) {
            await interaction.followUp({ content: `Eliminazione non andata a buon fine: il nome inserito non corrisponde`, ephemeral: true })
            return
        }

        await deleteTown(townName)
        await interaction.followUp({ content: `${townName} eliminata correttamente`, ephemeral: true })
    }
}
export default command