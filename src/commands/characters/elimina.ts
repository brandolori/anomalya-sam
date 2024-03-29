import { SlashCommandBuilder } from "discord.js"
import { getCampaign, getCharacterCampaigns, removeCharacterFromCampaignAndUpdatePlayer } from "../../campaigns.js"
import { removeCharacter, userCanWriteAutocomplete, userCanWriteCharacter } from "../../characters.js"
import { Command } from "../../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("elimina")
        .setDescription("Elimina un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il personaggio da eliminare")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()
        await userCanWriteAutocomplete(focusedValue, interaction)
    },
    steps: [
        { name: "name", type: "input", prompt: ["Conferma il nome del pg"] },
    ],
    callback: async (interaction, data, originalInteraction) => {
        const characterName = originalInteraction.options.getString("personaggio")
        const confirmName = data.name

        if (!(await userCanWriteCharacter(interaction.user.id, characterName))) {
            await interaction.followUp({ content: `Eliminazione non andata a buon fine: nessun personaggio trovato con questo nome`, ephemeral: true })
            return
        }
        if (characterName != confirmName) {
            await interaction.followUp({ content: `Eliminazione non andata a buon fine: il nome inserito non corrisponde`, ephemeral: true })
            return
        }
        const characterCampaigns = await getCharacterCampaigns(characterName)

        await Promise.all(characterCampaigns.map(async campaignName => {
            const campaign = await getCampaign(campaignName)
            await removeCharacterFromCampaignAndUpdatePlayer(characterName, campaign)
        }))

        await removeCharacter(characterName)
        await interaction.followUp({ content: `${characterName} eliminato correttamente`, ephemeral: true })
    }
}
export default command