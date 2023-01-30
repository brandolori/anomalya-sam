import { SlashCommandBuilder } from "discord.js"
import { addCampaignToPlayer, addCharacterToCampaign, getCampaign, campaignAutocomplete } from "../../campaigns.js"
import { getCharacter, getLightCharacter, userCanWriteAutocomplete } from "../../characters.js"
import { isAdmin } from "../../core.js"
import { Command } from "../../flow.js"
import { createPlayer, getPlayer } from "../../players.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("uniscipersonaggio")
        .setDescription("Unisci un personaggio ad una campagna")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il personaggio da aggiungere alla campagna")
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option =>
            option.setName("campagna")
                .setDescription("La campagna a cui aggiungere il personaggio")
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

        if (campaign.characters?.some(e => e.name == characterName)) {
            await interaction.editReply({ content: `Errore: ${characterName} è già presente in ${campaignName}!` })
            return
        }

        await addCharacterToCampaign(characterName, characterObj.user, campaignName)

        const character = await getCharacter(characterName)
        const player = await getPlayer(character.user)
        let newPlayerCreated = false

        if (!player) {
            await createPlayer(character.user)
            newPlayerCreated = true
        }

        if (newPlayerCreated || !player.campaigns?.includes(campaignName)) {
            await addCampaignToPlayer(campaignName, character.user)
        }

        await interaction.editReply({ content: `${characterName} aggiunto con successo a ${campaignName}!` })
    }
}
export default command