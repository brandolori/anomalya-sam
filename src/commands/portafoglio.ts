import { SlashCommandBuilder } from "discord.js"
import { updateCharacter, getUserCharacters, userHasCharacter, Money, addToInventory, getCharacterWallet, standardCharacterAutocomplete } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("portafoglio")
        .setDescription("Modifica una caratteristica di un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il nome del personaggio a cui dare le monete")
                .setRequired(true)
                .setAutocomplete(true)),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()
        await standardCharacterAutocomplete(focusedValue, interaction)
    },
    callback: async (interaction, _, originalInteraction) => {

        await interaction.deferReply({ ephemeral: true })

        const characterName = originalInteraction.options.getString("personaggio")

        if (!(await userHasCharacter(interaction.user.id, characterName))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${characterName}'` })
            return
        }

        const wallet = await getCharacterWallet(characterName, "zaino")

        const gp = wallet.find(el => el.equipment == "gp")?.amount ?? 0
        const sp = wallet.find(el => el.equipment == "sp")?.amount ?? 0
        const bp = wallet.find(el => el.equipment == "bp")?.amount ?? 0
        await interaction.editReply({ content: `Nel portafoglio di ${characterName} ci sono ${gp} monete d'oro, ${sp} monete d'argento, ${bp} monete di bronzo` })
    }
}
export default command