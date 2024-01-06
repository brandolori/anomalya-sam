import { SlashCommandBuilder } from "discord.js"
import { Money } from "../../common.js"
import { getEquipmentData, getEquipmentNames } from "../../equipment.js"
import { Command } from "../../flow.js"

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

        await interaction.deferReply({ ephemeral: true })

        const equipmentName = originalInteraction.options.getString("oggetto")
        const equipmentData = await getEquipmentData(equipmentName)

        if (equipmentData) {
            await interaction.editReply({ content: `Informazioni su ${equipmentData.name}:\nCosto: ${equipmentData.cost.quantity} ${Money.find(el => el.value == equipmentData.cost.unit).name}\nPeso: ${equipmentData.weight} libbre` })
        }
        else {
            await interaction.editReply({ content: `Nessun oggetto trovato con il nome di ${equipmentName}! Sei sicuro di aver scritto bene?` })
        }

    }
}
export default command