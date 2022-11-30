import { SlashCommandBuilder } from "discord.js"
import { updateCharacter, getUserCharacters, userHasCharacter, Money, addToInventory, getCharacterWallet } from "../data.js"
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
        const choices = (await getUserCharacters(interaction.user.id)).map(el => el.name)
        const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )
    },
    callback: async (interaction, _, originalInteraction) => {

        const characterName = originalInteraction.options.getString("personaggio")

        if (!(await userHasCharacter(interaction.user.id, characterName))) {
            await interaction.reply({ content: `Errore: non esiste il personaggio '${characterName}'`, ephemeral: true })
            return
        }

        const wallet = await getCharacterWallet(characterName, "zaino")

        const gp = wallet.find(el => el.equipment == "gp")?.amount ?? 0
        const sp = wallet.find(el => el.equipment == "sp")?.amount ?? 0
        const bp = wallet.find(el => el.equipment == "bp")?.amount ?? 0
        await interaction.reply({ content: `Nel portafoglio di ${characterName} ci sono ${gp} monete d'oro, ${sp} monete d'argento, ${bp} monete di bronzo`, ephemeral: true })
    }
}
export default command