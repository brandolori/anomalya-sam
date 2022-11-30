import { SlashCommandBuilder } from "discord.js"
import { getAllCharacters, getExpandedCharacterInventory, standardCharacterAutocomplete, userHasCharacter } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("inventario")
        .setDescription("Visualizza l'inventario di un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il personaggio di cui visualizzare l'inventario")
                .setAutocomplete(true)
                .setRequired(true)),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()
        await standardCharacterAutocomplete(focusedValue, interaction)
    },
    callback: async (interaction, _, originalInteraction) => {
        const characterName = originalInteraction.options.getString("personaggio")

        if (!(await userHasCharacter(interaction.user.id, characterName))) {
            await interaction.reply({ content: `Errore: non esiste il personaggio '${characterName}`, ephemeral: true })
            return
        }

        const equipment = await getExpandedCharacterInventory(characterName, "zaino")
        const equipmentString = equipment.map(el => `${el.amount} ${el.name}`).join("\n")

        const totalWeight = equipment.reduce((prev, cur) => prev + cur.amount * cur.weight, 0)
        const amount = equipment.reduce((prev, cur) => prev + cur.amount, 0)

        await interaction.reply({ content: `L'inventario di ${characterName} contiene ${amount} oggetti, per un peso totale di ${totalWeight} lbs:\n\n${equipmentString}`, ephemeral: true })
    }
}
export default command