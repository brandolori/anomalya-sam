import { SlashCommandBuilder } from "discord.js"
import { getCampaign, removeCharacterFromCampaignAndUpdatePlayer, campaignAutocomplete } from "../campaigns.js"
import { getLightCharacter, userCanWriteAutocomplete } from "../characters.js"
import { isAdmin } from "../core.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("rimuovipersonaggio")
        .setDescription("Rimuovi un personaggio da una campagna")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il personaggio da rimuovere dalla campagna")
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option =>
            option.setName("campagna")
                .setDescription("La campagna da cui rimuovere il personaggio")
                .setAutocomplete(true)
                .setRequired(true)),
    autocomplete: async (interaction) => {
        if (!isAdmin(interaction.user.id)) {
            await interaction.respond([])
            return
        }
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === "personaggio") {
            const focusedValue = focusedOption.value
            await userCanWriteAutocomplete(focusedValue, interaction)
        } else if (focusedOption.name === "campagna") {
            const focusedValue = focusedOption.value
            await campaignAutocomplete(focusedValue, interaction)
        }
    },
    adminOnly: true,
    callback: async (interaction, _, originalInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        const characterName = originalInteraction.options.getString("personaggio")
        const campaignName = originalInteraction.options.getString("campagna")

        const characterObj = await getLightCharacter(characterName)
        if (!characterObj) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${characterName}!'` })
            return
        }

        const campaign = await getCampaign(campaignName)
        if (!campaign) {
            await interaction.editReply({ content: `Errore: non esiste la campagna '${campaignName}!'` })
            return
        }

        if (!campaign.characters || !campaign.characters.some(e => e.name == characterName)) {
            await interaction.editReply({ content: `Errore: ${characterName} non fa parte di ${campaignName}!` })
            return
        }

        await removeCharacterFromCampaignAndUpdatePlayer(characterName, campaign)

        await interaction.editReply({ content: `${characterName} rimosso con successo da ${campaignName}!` })
    }
}
export default command