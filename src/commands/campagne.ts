import { SlashCommandBuilder } from "discord.js"
import { getCampaigns } from "../campaigns.js"
import { isAdmin } from "../core.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("campagne")
        .setDescription("Mostra tutte le campagne"),
    callback: async (interaction) => {
        await interaction.deferReply({ ephemeral: true })

        if (!isAdmin(interaction.user.id)) {
            await interaction.editReply({ content: `Oooops! Questo comando è solo per i DM` })
            return
        }

        const campaigns = await getCampaigns()
        const campaignsString = campaigns.map(el =>
            `Nome: ${el.name}\nNumero giocatori: ${el.characters?.length ?? 0}`
        ).join("\n\n")
        await interaction.editReply({ content: `Trovate ${campaigns.length} campagne${campaigns.length > 0 ? ":" : ""}\n\n${campaignsString}` })
    }
}
export default command