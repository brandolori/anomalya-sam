import { SlashCommandBuilder } from "discord.js"
import { getEquipmentData, getEquipmentNames, standardCharacterAutocomplete } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("oggetto")
        .setDescription("Visualizza informazioni su un oggetto")
        .addStringOption(option =>
            option.setName("oggetto")
                .setDescription("L'oggetto su cui visualizzare le informazioni")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    autocomplete: async (interaction) => {
        try {
            const focusedValue = interaction.options.getFocused()
            const choices = (await getEquipmentNames()).slice(0, 24)
            const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            )
        } catch (e) { }
    },
    callback: async (interaction, _, originalInteraction) => {

        interaction.deferReply({ ephemeral: true })

        const name = originalInteraction.options.getString("oggetto")
        const eqData = await getEquipmentData(name)

        if (eqData) {
            await interaction.editReply({ content: `Informazioni su ${eqData.name}:\nCosto: ${eqData.cost.quantity} ${eqData.cost.unit}\nPeso: ${eqData.weight} lbs` })
        }
        else {
            await interaction.editReply({ content: `Nessun oggetto trovato con il nome di ${name}! Sei sicuro di aver scritto bene?` })
        }

    }
}
export default command