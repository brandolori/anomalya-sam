import { SlashCommandBuilder } from "discord.js"
import { addToInventory, getAllCharacters, getEquipmentNames } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("raccogli")
        .setDescription("Aggiungi un elemento all'inventario del personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il personaggio a cui dare l'oggetto")
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option =>
            option.setName("oggetto")
                .setDescription("L'oggetto da inserire nell'inventario")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    autocomplete: async (interaction) => {

        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === "personaggio") {
            const focusedValue = focusedOption.value
            const choices = (await getAllCharacters()).map(el => el.name)
            const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
            interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            )
        } else if (focusedOption.name === "oggetto") {
            const focusedValue = focusedOption.value
            const choices = (await getEquipmentNames()).slice(0, 24)
            const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
            interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            )
        }
    },
    callback: async (interaction, _, originalInteraction) => {
        const oggetto = originalInteraction.options.getString("oggetto")
        const personaggio = originalInteraction.options.getString("personaggio")
        await addToInventory(personaggio, "zaino", oggetto, 1)

        await interaction.reply({ content: `Operazione completata con successo!`, ephemeral: true })
    }
}
export default command