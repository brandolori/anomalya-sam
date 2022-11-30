import { SlashCommandBuilder } from "discord.js"
import { updateCharacter, getUserCharacters, userHasCharacter, Money, addToInventory, standardCharacterAutocomplete } from "../data.js"
import { Command } from "../flow.js"

const moneyChoices = [
    { name: "Monete d'oro", value: "gp" },
    { name: "Monete d'argento", value: "sp" },
    { name: "Monete di bronzo", value: "bp" }
]

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("guadagna")
        .setDescription("Modifica una caratteristica di un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il nome del personaggio a cui dare le monete")
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName("moneta")
                .setDescription("Il tipo di moneta da aggiungere al portafoglio")
                .setRequired(true)
                .setChoices(...moneyChoices))
        .addNumberOption(option =>
            option.setName("importo")
                .setDescription("La quantità di monete")
                .setRequired(true)),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()
        await standardCharacterAutocomplete(focusedValue, interaction)
    },
    callback: async (interaction, _, originalInteraction) => {

        const characterName = originalInteraction.options.getString("personaggio")
        const moneta = originalInteraction.options.getString("moneta")
        const importo = originalInteraction.options.getNumber("importo")

        if (!(await userHasCharacter(interaction.user.id, characterName))) {
            await interaction.reply({ content: `Errore: non esiste il personaggio '${characterName}'`, ephemeral: true })
            return
        }

        await addToInventory(characterName, "zaino", moneta, importo)
        interaction.reply({ content: `Monete aggiunte nel portafoglio di ${characterName}!`, ephemeral: true })

    }
}
export default command