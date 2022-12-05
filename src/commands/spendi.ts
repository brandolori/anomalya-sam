import { SlashCommandBuilder } from "discord.js"
import { updateCharacter, getUserCharacters, userHasCharacter, Money, addToInventory, standardCharacterAutocomplete, removeFromInventory, removeCoins } from "../data.js"
import { Command } from "../flow.js"

const moneyChoices = [
    { name: "Monete d'oro", value: "gp" },
    { name: "Monete d'argento", value: "sp" },
    { name: "Monete di bronzo", value: "bp" }
]

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("spendi")
        .setDescription("Rimuovi monete dal portafoglio di un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il nome del personaggio a cui dare le monete")
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName("moneta")
                .setDescription("Il tipo di moneta da rimuovere dal portafoglio")
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

        await interaction.deferReply({ ephemeral: true })

        const characterName = originalInteraction.options.getString("personaggio")
        const moneta = originalInteraction.options.getString("moneta")
        const importo = originalInteraction.options.getNumber("importo")

        if (!(await userHasCharacter(interaction.user.id, characterName))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${characterName}'` })
            return
        }
        try {

            await removeCoins(characterName, "zaino", moneta, importo)
            await interaction.editReply({ content: `Monete rimosse dal portafoglio di ${characterName}!` })
        } catch (e) {
            if (e.message = "notenough")
                await interaction.editReply({ content: `Errore: nel portafoglio di ${characterName} non ci sono abbastanza monete!` })
        }
    }

}

export default command