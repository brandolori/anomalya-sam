import { chatInputApplicationCommandMention, GuildMember, SlashCommandBuilder } from "discord.js"
import { getAllCharacters, getCharacterInventory, getExpandedCharacterInventory, userHasCharacter } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("inventario")
        .setDescription("Visualizza l'inventario di un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il personaggio a cui dare l'oggetto")
                .setAutocomplete(true)
                .setRequired(true)),
    autocomplete: async (interaction) => {

        const focusedValue = interaction.options.getFocused()
        const choices = (await getAllCharacters()).map(el => el.name)
        const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
        interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )

    },
    callback: async (interaction, _, originalInteraction) => {
        const characterName = originalInteraction.options.getString("personaggio")

        if (!(await userHasCharacter(interaction.member as GuildMember, characterName))) {
            await interaction.reply({ content: `Errore: non esiste il personaggio '${characterName}`, ephemeral: true })
            return
        }

        const equipment = await getExpandedCharacterInventory(characterName, "zaino")
        const equipmentString = equipment.map(el => `${el.amount} ${el.name}`).join("\n")

        await interaction.reply({ content: `Inventario di ${characterName}:\n\n${equipmentString}`, ephemeral: true })
    }
}
export default command