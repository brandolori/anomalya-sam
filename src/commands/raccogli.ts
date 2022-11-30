import { SlashCommandBuilder } from "discord.js"
import { addToInventory, checkEquipmentExists, equipmentIndex, getAllCharacters, getEquipmentNames, getUserCharacters, standardCharacterAutocomplete, userHasCharacter } from "../data.js"
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
                const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
                await interaction.respond(
                    filtered.map(choice => ({ name: choice, value: choice })),
                )
            } catch (e) { }
        }
    },
    callback: async (interaction, _, originalInteraction) => {

        await interaction.deferReply({ ephemeral: true })

        const oggetto = originalInteraction.options.getString("oggetto")
        const personaggio = originalInteraction.options.getString("personaggio")
        const numeroOption = originalInteraction.options.getNumber("numero") ?? 1
        const numero = Math.max(numeroOption, 1)

        if (!(await userHasCharacter(interaction.user.id, personaggio))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${personaggio}'` })
            return
        }

        if (!(await checkEquipmentExists(oggetto))) {
            await interaction.editReply({ content: `Errore: non esiste l'oggetto '${oggetto}'` })
            return
        }

        const eqIndex = await equipmentIndex(oggetto)

        await addToInventory(personaggio, "zaino", eqIndex, numero)

        await interaction.editReply({ content: `Operazione completata con successo!` })
    }
}
export default command