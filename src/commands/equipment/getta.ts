import { SlashCommandBuilder } from "discord.js"
import { userCanWriteAutocomplete, userCanWriteCharacter, getLightCharacter } from "../../characters.js"
import { CARRY_CAPACITY_MESSAGE } from "../../common.js"
import { getEquipmentIndex, getExpandedCharacterInventory, removeFromInventory } from "../../equipment.js"
import { Command } from "../../flow.js"

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
            await userCanWriteAutocomplete(focusedValue, interaction)
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
        const characterName = originalInteraction.options.getString("personaggio")
        const equipmentAmount = originalInteraction.options.getNumber("numero") ?? 1
        const sanitizedEquipmentAmount = Math.max(equipmentAmount, 1)

        if (!(await userCanWriteCharacter(interaction.user.id, characterName))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${characterName}'` })
            return
        }

        const equipmentIndex = await getEquipmentIndex(equipmentName)

        if (!equipmentIndex) {
            await interaction.editReply({ content: `Errore: non esiste l'oggetto '${equipmentName}'` })
            return
        }

        try {
            await removeFromInventory(characterName, "zaino", equipmentIndex, sanitizedEquipmentAmount)

            const equipment = await getExpandedCharacterInventory(characterName, "zaino")

            const totalWeight = equipment.reduce((prev, cur) => prev + (cur.amount * cur.weight), 0)

            await interaction.editReply({ content: `Operazione completata con successo! Lo zaino di ${characterName} pesa ora ${totalWeight} libbre` })

            const character = await getLightCharacter(characterName)

            const carryCapacity = character.strength * 15

            if (totalWeight > carryCapacity)
                await interaction.followUp({ content: CARRY_CAPACITY_MESSAGE, ephemeral: true })

        } catch (e) {
            if (e.message == "notpresent")
                await interaction.editReply({ content: `Errore: nello zaino di ${characterName} non c'è neanche un ${equipmentName}` })
            else
                await interaction.editReply({ content: `Errore generico` })

        }
    }
}
export default command