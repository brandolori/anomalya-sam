import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { Command } from "../flow.js"
import { getAllTownNames, getTown } from "../towns.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("città")
        .setDescription("Visualizza informazioni su una città")
        .addStringOption(option =>
            option.setName("nome")
                .setDescription("Il nome della città")
                .setAutocomplete(true)
                .setRequired(true)),
    autocomplete: async (interaction) => {

        const focusedValue = interaction.options.getFocused()
        try {
            const choices = await getAllTownNames()
            const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            )
        } catch (e) {
            console.log(`timeout autocompletamento in ${interaction.commandName}`)
        }
    },
    callback: async (interaction, _, originalInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        const townName = originalInteraction.options.getString("nome")

        const town = await getTown(townName)

        let files = []
        let embeds = []

        const embed = new EmbedBuilder()
            .setTitle(town.name)
            .setDescription(
                `_${town.description ?? "Nessuna descrizione fornita"}_`
            )

        if (town.picture) {
            const townImage = new AttachmentBuilder(town.picture.buffer)
                .setName("picture.webp")
            embed.setImage('attachment://picture.webp')
            files.push(townImage)
        }
        embeds.push(embed)

        await interaction.editReply({
            content: "",
            embeds,
            files
        })
    }
}
export default command