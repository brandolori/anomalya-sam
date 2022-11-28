import { SlashCommandBuilder } from "discord.js"
import { getEquipmentData, getEquipmentNames } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("oggetti")
        .setDescription("Visualizza informazioni su un oggetto")
        .addStringOption(option =>
            option.setName("oggetto")
                .setDescription("L'oggetto di cui visualizzare le informazioni")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()
        const choices = (await getEquipmentNames()).slice(0, 24)
        const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
        interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )
    },
    callback: async (interaction, _, originalInteraction) => {
        const name = originalInteraction.options.getString("oggetto")
        const eqData = await getEquipmentData(name)

        if (eqData) {
            await interaction.reply({ content: `Informazioni su ${eqData.name}:\nCosto: ${eqData.cost.quantity} ${eqData.cost.unit}\nPeso: ${eqData.weight} lbs`, ephemeral: true })
        }
        else {
            await interaction.reply({ content: `Nessun oggetto trovato con il nome di ${name}! Sei sicuro di aver scritto bene?`, ephemeral: true })
        }

    }
}
export default command