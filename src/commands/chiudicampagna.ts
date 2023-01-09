import { SlashCommandBuilder } from "discord.js"
import { createCampaign, deleteCampaign, getCampaign, getCampaigns, getPlayerCampaigns, removeCampaignFromPlayer } from "../campaigns.js"
import { isAdmin } from "../core.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("chiudicampagna")
        .setDescription("Chiudi una campagna in corso")
        .addStringOption(option =>
            option.setName("nome")
                .setDescription("Il nome della campagna da chiudere")
                .setRequired(true)
                .setAutocomplete(true)),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()

        const choices = isAdmin(interaction.user.id)
            ? (await getCampaigns()).map(el => el.name)
            : (await getPlayerCampaigns(interaction.user.id)).slice(0, 24)
        const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )
    },
    steps: [
        { name: "name", type: "input", prompt: ["Conferma il nome della campagna"] },
    ],
    callback: async (interaction, _, originalInteraction) => {

        if (!isAdmin(interaction.user.id)) {
            await interaction.followUp({ content: `Oooops! Questo comando è solo per i DM`, ephemeral: true })
            return
        }

        const campaignName = originalInteraction.options.getString("nome")

        const campaign = await getCampaign(campaignName)

        if (!campaign) {
            await interaction.followUp({ content: `Errore! La campagna '${campaignName}' non esiste`, ephemeral: true })
            return
        }

        // create set of unique campaign users
        const players = new Set(campaign.characters.map(el => el.user))

        players.forEach(el => removeCampaignFromPlayer(campaignName, el))

        await deleteCampaign(campaignName)
        await interaction.followUp({ content: `${campaignName} eliminata correttamente`, ephemeral: true })
    }
}
export default command