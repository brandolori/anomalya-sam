import { APIInteractionGuildMember, GuildMember, SlashCommandBuilder } from "discord.js"
import { getUserCharacters, removeCharacter, userHasCharacter } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("elimina")
        .setDescription("Elimina un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il personaggio da eliminare")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()
        const choices = (await getUserCharacters(interaction.member as GuildMember)).map(el => el.name)
        const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
        interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )
    },
    steps: [
        { name: "name", type: "input", prompt: "Conferma il nome del pg" },
    ],
    callback: async (interaction, data, originalInteraction) => {
        const originalName = originalInteraction.options.getString("personaggio")
        const confirmName = data.name

        if (!(await userHasCharacter(interaction.member as GuildMember, originalName))) {
            await interaction.followUp({ content: `Eliminazione non andata a buon fine: nessun personaggio trovato con questo nome`, ephemeral: true })
            return
        }

        if (originalName == confirmName) {
            await removeCharacter(originalName)

            interaction.followUp({ content: `${originalName} eliminato correttamente`, ephemeral: true })
        } else {
            interaction.followUp({ content: `Eliminazione non andata a buon fine: il nome inserito non corrisponde`, ephemeral: true })
        }
    }
}
export default command