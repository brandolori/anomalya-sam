import { SlashCommandBuilder } from "discord.js"
import { addToInventory, checkEquipmentExists, getEquipmentIndex, getEquipmentNames, standardCharacterAutocomplete, userHasCharacter } from "../data.js"
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
                .setRequired(true))
        .addNumberOption(option =>
            option.setName("numero")
                .setDescription("La qantità di oggetti da raccogliere")
        ),
    autocomplete: async (interaction) => {

        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === "personaggio") {
            const focusedValue = focusedOption.value
            await standardCharacterAutocomplete(focusedValue, interaction)
        } else if (focusedOption.name === "oggetto") {
            try {
                const focusedValue = focusedOption.value
                const choices = (await getEquipmentNames()).slice(0, 24)
                const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
                await interaction.respond(
                    filtered.map(choice => ({ name: choice, value: choice })),
                )
            } catch (e) { }
        }
    },
    callback: async (interaction, _, originalInteraction) => {

        await interaction.deferReply({ ephemeral: true })

        const equipmentName = originalInteraction.options.getString("oggetto")
        const characterName = originalInteraction.options.getString("personaggio")
        const equipmentAmount = originalInteraction.options.getNumber("numero") ?? 1
        const sanitizedEquipmentAmount = Math.max(equipmentAmount, 1)

        if (!(await userHasCharacter(interaction.user.id, characterName))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${characterName}'` })
            return
        }

        const eqIndex = await getEquipmentIndex(equipmentName)

        if (!eqIndex) {
            await interaction.editReply({ content: `Errore: non esiste l'oggetto '${equipmentName}'` })
            return
        }

        await addToInventory(characterName, "zaino", eqIndex, sanitizedEquipmentAmount)

        await interaction.editReply({ content: `Operazione completata con successo!` })
    }
}
export default command