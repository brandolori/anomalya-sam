import { SlashCommandBuilder } from "discord.js"
import { Money } from "../common.js"
import { userCanWriteCharacter, userCanWriteAutocomplete } from "../characters.js"
import { Command } from "../flow.js"
import { removeCoins } from "../equipment.js"

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
                .setChoices(...Money))
        .addNumberOption(option =>
            option.setName("importo")
                .setDescription("La quantità di monete")
                .setRequired(true)),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()
        await userCanWriteAutocomplete(focusedValue, interaction)
    },
    callback: async (interaction, _, originalInteraction) => {

        await interaction.deferReply({ ephemeral: true })

        const characterName = originalInteraction.options.getString("personaggio")
        const coin = originalInteraction.options.getString("moneta")
        const coinAmount = originalInteraction.options.getNumber("importo")

        if (!(await userCanWriteCharacter(interaction.user.id, characterName))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${characterName}'` })
            return
        }
        try {

            await removeCoins(characterName, "zaino", coin, coinAmount)
            await interaction.editReply({ content: `Monete rimosse dal portafoglio di ${characterName}!` })
        } catch (e) {
            if (e.message = "notenough")
                await interaction.editReply({ content: `Errore: nel portafoglio di ${characterName} non ci sono abbastanza monete!` })
        }
    }

}

export default command