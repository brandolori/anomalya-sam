import { SlashCommandBuilder } from "discord.js"
import { checkEquipmentExists, equipmentIndex, getExpandedCharacterInventory, removeFromInventory, standardCharacterAutocomplete, userHasCharacter } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("getta")
        .setDescription("Rimuovi un elemento dall'inventario del personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il personaggio a cui rimuovere l'oggetto")
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option =>
            option.setName("oggetto")
                .setDescription("L'oggetto da rimuovere dall'inventario")
                .setAutocomplete(true)
                .setRequired(true))
        .addNumberOption(option =>
            option.setName("numero")
                .setDescription("La qantità di oggetti da rimuovere")
        ),
    autocomplete: async (interaction) => {

        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === "personaggio") {
            const focusedValue = focusedOption.value
            await standardCharacterAutocomplete(focusedValue, interaction)
        } else if (focusedOption.name === "oggetto") {
            try {
                const focusedValue = focusedOption.value
                const personaggio = interaction.options.getString("personaggio")
                const choices = (await getExpandedCharacterInventory(personaggio, "zaino")).slice(0, 24).map(el => el.name)
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
        const personaggio = originalInteraction.options.getString("personaggio")
        const numeroOption = originalInteraction.options.getNumber("numero") ?? 1
        const numero = Math.max(numeroOption, 1)

        if (!(await userHasCharacter(interaction.user.id, personaggio))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${personaggio}'` })
            return
        }

        if (!(await checkEquipmentExists(equipmentName))) {
            await interaction.editReply({ content: `Errore: non esiste l'oggetto '${equipmentName}'` })
            return
        }
        try {


            const eqIndex = await equipmentIndex(equipmentName)
            await removeFromInventory(personaggio, "zaino", eqIndex, numero)

            await interaction.editReply({ content: `Operazione completata con successo!` })
        } catch (e) {
            if (e.message = "notpresent")
                await interaction.editReply({ content: `Errore: nell'inventario di ${personaggio} non c'è neanche un ${equipmentName}` })
        }
    }
}
export default command