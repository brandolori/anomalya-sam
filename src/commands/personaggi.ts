import { SlashCommandBuilder } from "discord.js"
import { isAdmin } from "../core.js"
import { getUserCharacters } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("personaggi")
        .setDescription("Mostra tutti i tui personaggi"),
    callback: async (interaction) => {
        await interaction.deferReply({ ephemeral: true })

        const userCharacters = await getUserCharacters(interaction.user.id)
        const calledByAdmin = await isAdmin(interaction.user.id)
        const userCharactersString = userCharacters.map(el =>
            `Nome: ${el.name}${calledByAdmin ? `\nProprietario: <@${el.user}>` : ""}`
        ).join("\n\n")
        await interaction.editReply({ content: `Trovati ${userCharacters.length} personaggi${userCharacters.length > 0 ? ":" : ""}\n\n${userCharactersString}` })
    }
}
export default command