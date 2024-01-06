import { SlashCommandBuilder } from "discord.js"
import { Command } from "../../flow.js"
import { createTown } from "../../towns.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("creacittà")
        .setDescription("Crea una nuova città")
        .addStringOption(option =>
            option.setName("nome")
                .setDescription("Il nome della nuova città")
                .setRequired(true)),
    steps: [
        { name: "description", type: "input", prompt: ["Inserisci una descrizione della città"] },
    ],
    adminOnly: true,
    callback: async (interaction, data, originalInteraction) => {

        const townName = originalInteraction.options.getString("nome")
        const townDescription = data.description[0]

        try {
            await createTown(townName, townDescription)
            await interaction.followUp({ content: `${townName} creata correttamente!\nInviami un'immagine in chat per aggiungere una mappa`, ephemeral: true })
        } catch (e) {
            await interaction.followUp({ content: `Errore: ${e.message}!`, ephemeral: true })
        }

    }
}
export default command