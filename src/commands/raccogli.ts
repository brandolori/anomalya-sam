import { GuildMember, SlashCommandBuilder } from "discord.js"
import { addToInventory, checkEquipmentExists, getAllCharacters, getEquipmentNames, getUserCharacters, userHasCharacter } from "../data.js"
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
            const choices = (await getUserCharacters(interaction.member as GuildMember)).slice(0, 24).map(el => el.name)
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
        const numeroOption = originalInteraction.options.getNumber("numero") ?? 1
        const numero = Math.max(numeroOption, 1)

        if (!(await userHasCharacter(interaction.member as GuildMember, personaggio))) {
            await interaction.reply({ content: `Errore: non esiste il personaggio '${personaggio}'`, ephemeral: true })
            return
        }

        if (!(await checkEquipmentExists(oggetto))) {
            await interaction.reply({ content: `Errore: non esiste l'oggetto '${oggetto}'`, ephemeral: true })
            return
        }

        await addToInventory(personaggio, "zaino", oggetto, numero)

        await interaction.reply({ content: `Operazione completata con successo!`, ephemeral: true })
    }
}
export default command