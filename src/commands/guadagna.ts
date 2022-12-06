import { SlashCommandBuilder } from "discord.js"
import { Money } from "../common.js"
import { userHasCharacter, addToInventory, standardCharacterAutocomplete } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("guadagna")
        .setDescription("Aggiungi monete nel portafoglio di un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il nome del personaggio a cui dare le monete")
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName("moneta")
                .setDescription("Il tipo di moneta da aggiungere al portafoglio")
                .setRequired(true)
                .setChoices(...Money))
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
        const coinType = originalInteraction.options.getString("moneta")
        const coinAmount = originalInteraction.options.getNumber("importo")

        if (!(await userHasCharacter(interaction.user.id, characterName))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${characterName}'` })
            return
        }

        await addToInventory(characterName, "zaino", coinType, coinAmount)
        await interaction.editReply({ content: `Monete aggiunte nel portafoglio di ${characterName}!` })

    }
}
export default command