import { APIInteractionGuildMember, GuildMember, SlashCommandBuilder } from "discord.js"
import { getUserCharacters } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("personaggi")
        .setDescription("Mostra tutti i tui personaggi"),
    callback: async (interaction) => {
        const userCharacters = await getUserCharacters(interaction.member as GuildMember)
        const userCharactersString = userCharacters.map(el =>
            `Nome: ${el.name}
Razza: ${el.race}
STR: ${el.strength}
DEX: ${el.dexterity}
CON: ${el.constitution}
INT: ${el.intelligence}
WIS: ${el.winsdom}
CHA: ${el.charisma}`
        ).join("\n\n")
        interaction.reply({ content: `Trovati ${userCharacters.length} personaggi${userCharacters.length > 0 ? ":" : ""}\n\n${userCharactersString}`, ephemeral: true })
    }
}
export default command