import { SlashCommandBuilder } from "discord.js"
import { getAllCampaigns } from "../campaigns.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("campagne")
        .setDescription("Mostra tutte le campagne"),
    adminOnly: true,
    callback: async (interaction) => {
        await interaction.deferReply({ ephemeral: true })

        const campaigns = await getAllCampaigns()
        const campaignsString = campaigns.map(el =>
            `Nome: ${el.name}\nNumero giocatori: ${el.characters?.length ?? 0}`
        ).join("\n\n")
        await interaction.editReply({ content: `Trovate ${campaigns.length} campagne${campaigns.length > 0 ? ":" : ""}\n\n${campaignsString}` })
    }
}
export default command