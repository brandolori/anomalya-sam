import { SlashCommandBuilder } from "discord.js"
import { createCampaign } from "../campaigns.js"
import { isAdmin } from "../core.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("apricampagna")
        .setDescription("Crea una nuova campagna")
        .addStringOption(option =>
            option.setName("nome")
                .setDescription("Il nome della nuova campagna")
                .setRequired(true)),
    steps: [
        { name: "description", type: "input", prompt: ["Inserisci una descrizione della campagna"] },
    ],
    callback: async (interaction, data, originalInteraction) => {

        if (!isAdmin(interaction.user.id)) {
            await interaction.followUp({ content: `Oooops! Questo comando è solo per i DM`, ephemeral: true })
            return
        }

        const campaignName = originalInteraction.options.getString("nome")
        const campaignDescription = data.description[0]

        try {
            await createCampaign(campaignName, campaignDescription)
            interaction.followUp({ content: `${campaignName} creata correttamente!\nComincia ad aggiungere personaggi con **/uniscipersonaggio**`, ephemeral: true })
        } catch (e) {
            interaction.followUp({ content: `Errore: ${e.message}!`, ephemeral: true })
        }

    }
}
export default command