import { SlashCommandBuilder } from "discord.js"
import { getUserCharacters } from "../characters.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("giocatore")
        .setDescription("Mostra i personaggi di un giocatore")
        .addUserOption(option =>
            option.setName("giocatore")
                .setDescription("Il giocatore di cui mostrare i personaggi")
                .setRequired(true)),
    adminOnly: true,
    callback: async (interaction, _, originalInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        const user = originalInteraction.options.getUser("giocatore")

        const userCharacters = await getUserCharacters(user.id)
        const userCharactersString = userCharacters.map(el =>
            `Nome: ${el.name}`
        ).join("\n\n")
        await interaction.editReply({ content: `L'utente <@${user.id}> ha ${userCharacters.length} personaggi${userCharacters.length > 0 ? ":" : ""}\n\n${userCharactersString}` })
    }
}
export default command