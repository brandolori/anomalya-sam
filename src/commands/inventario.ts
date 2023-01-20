import { SlashCommandBuilder } from "discord.js"
import { getLightCharacter, userCanWriteAutocomplete, userCanWriteCharacter } from "../characters.js"
import { getExpandedCharacterInventory } from "../equipment.js"
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
        await userCanWriteAutocomplete(focusedValue, interaction)
    },
    callback: async (interaction, _, originalInteraction) => {

        await interaction.deferReply({ ephemeral: true })

        const characterName = originalInteraction.options.getString("personaggio")

        if (!(await userCanWriteCharacter(interaction.user.id, characterName))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${characterName}` })
            return
        }

        const equipment = await getExpandedCharacterInventory(characterName, "zaino")
        const equipmentString = equipment.map(el => `• ${el.amount} ${el.name}`).join("\n")

        const totalWeight = equipment.reduce((prev, cur) => prev + cur.amount * cur.weight, 0)
        const equipmentAmount = equipment.reduce((prev, cur) => prev + cur.amount, 0)

        const character = await getLightCharacter(characterName)

        const carryCapacity = character.strength * 15

        await interaction.editReply({ content: `L'inventario di ${characterName} contiene ${equipmentAmount} oggetti, per un peso totale di ${totalWeight} libbre sulle ${carryCapacity} che può trasportare${equipmentAmount ? ":" : ""}\n\n${equipmentString}` })
    }
}
export default command