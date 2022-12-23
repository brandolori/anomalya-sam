import { SlashCommandBuilder } from "discord.js"
import { addCampaignToPlayer, addCharacterToCampaign, checkCampaignExists, getCampaign, getCampaigns, getPlayerCampaigns, removeCampaignFromPlayer, removeCharacterFromCampaign } from "../campaigns.js"
import { isAdmin } from "../core.js"
import { checkCharacterExists, getCharacter, getLightCharacter, standardCharacterAutocomplete, userHasCharacter } from "../data.js"
import { Command } from "../flow.js"
import { createPlayer, getPlayer } from "../players.js"

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
        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === "personaggio") {
            const focusedValue = focusedOption.value
            await standardCharacterAutocomplete(focusedValue, interaction)
        } else if (focusedOption.name === "campagna") {
            try {
                const focusedValue = focusedOption.value
                const choices = (await getCampaigns()).map(el => el.name).slice(0, 24)
                const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
                await interaction.respond(
                    filtered.map(choice => ({ name: choice, value: choice })),
                )
            } catch (e) { }
        }
    },
    callback: async (interaction, _, originalInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        if (!isAdmin(interaction.user.id)) {
            await interaction.editReply({ content: `Oooops! Questo comando è solo per i DM` })
            return
        }

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

        await removeCharacterFromCampaign(characterName, characterObj.user, campaignName)

        const character = await getCharacter(characterName)
        const player = await getPlayer(character.user)

        const playerHasOtherCharactersInCampaign = campaign.characters.filter((el) => el.name != characterName)
            .some((el) => el.user == player.userId)

        if (!playerHasOtherCharactersInCampaign) {
            await removeCampaignFromPlayer(campaignName, player.userId)
        }

        await interaction.editReply({ content: `${characterName} rimosso con successo da ${campaignName}!` })
    }
}
export default command