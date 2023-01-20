import { SlashCommandBuilder } from "discord.js"
import { getOwnedCharacters } from "../characters.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("personaggi")
        .setDescription("Mostra tutti i tuoi personaggi"),
    callback: async (interaction) => {
        await interaction.deferReply({ ephemeral: true })

        const userCharacters = await getOwnedCharacters(interaction.user.id)
        const userCharactersString = userCharacters.map(el =>
            `Nome: ${el.name}`
        ).join("\n\n")
        await interaction.editReply({ content: `Trovati ${userCharacters.length} personaggi${userCharacters.length > 0 ? ":" : ""}\n\n${userCharactersString}` })
    }
}
export default command