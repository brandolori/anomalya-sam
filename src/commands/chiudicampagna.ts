import { SlashCommandBuilder } from "discord.js"
import { deleteCampaign, getCampaign, removeCampaignFromPlayer, campaignAutocomplete } from "../campaigns.js"
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
        if (!isAdmin(interaction.user.id)) {
            await interaction.respond([])
            return
        }
        const focusedValue = interaction.options.getFocused()

        await campaignAutocomplete(focusedValue, interaction)
    },
    steps: [
        { name: "name", type: "input", prompt: ["Conferma il nome della campagna"] },
    ],
    adminOnly: true,
    callback: async (interaction, data, originalInteraction) => {

        const campaignName = originalInteraction.options.getString("nome")
        const confirmName = data.name

        const campaign = await getCampaign(campaignName)

        if (!campaign) {
            await interaction.followUp({ content: `Errore! La campagna '${campaignName}' non esiste`, ephemeral: true })
            return
        }

        if (campaignName != confirmName) {
            await interaction.followUp({ content: `Eliminazione non andata a buon fine: il nome inserito non corrisponde`, ephemeral: true })
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