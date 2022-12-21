import { SlashCommandBuilder } from "discord.js"
import { addCharacterToCampaign, checkCampaignExists, getCampaign, getCampaigns } from "../campaigns.js"
import { isAdmin } from "../core.js"
import { checkCharacterExists, getLightCharacter, standardCharacterAutocomplete, userHasCharacter } from "../data.js"
import { Command } from "../flow.js"

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

        if (!(await checkCharacterExists(characterName))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${characterName}'` })
            return
        }

        const characterObj = await getLightCharacter(characterName)
        if (!characterObj) {
            await interaction.editReply({ content: `Errore: non esiste la campagna '${campaignName}'` })
            return
        }

        const campaign = await getCampaign(campaignName)

        await addCharacterToCampaign(characterName, characterObj.user, campaignName)

        await interaction.editReply({ content: `${characterName} aggiunto con successo a ${campaignName}` })
    }
}
export default command