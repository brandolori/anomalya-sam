import { SlashCommandBuilder } from "discord.js"
import { getCampaign, getAllCampaigns, getPlayerCampaigns, playerHasCampaign } from "../campaigns.js"
import { isAdmin } from "../core.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("campagna")
        .setDescription("Mostra informazioni sulla campagna")
        .addStringOption(option =>
            option.setName("campagna")
                .setDescription("Il nome della campagna")
                .setAutocomplete(true)
                .setRequired(true)),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()

        const choices = isAdmin(interaction.user.id)
            ? (await getAllCampaigns()).map(el => el.name)
            : (await getPlayerCampaigns(interaction.user.id)).slice(0, 24)
        const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )
    },
    callback: async (interaction, _, originalInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        const campaignName = originalInteraction.options.getString("campagna")

        if (!(await playerHasCampaign(interaction.user.id, campaignName))) {
            await interaction.editReply({ content: `Errore: non esiste una campagna chiamata ${campaignName}` })
            return
        }

        const campaign = await getCampaign(campaignName)

        const characterString = campaign.characters?.map(el => `${el.name}\n<@${el.user}>`).join("\n\n") ?? ""

        await interaction.editReply({ content: `Nome: ${campaignName}\n\nDescrizione:\n_${campaign.description}_\n\nPersonaggi:\n${characterString}` })
    }
}
export default command