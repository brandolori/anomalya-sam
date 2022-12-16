import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { isAdmin } from "../core.js"
import { getCharacter, standardCharacterAutocomplete, userHasCharacter } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("personaggio")
        .setDescription("Visualizza informazioni su un personaggio")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il personaggio su cui visualizzare le informazioni")
                .setAutocomplete(true)
                .setRequired(true)),
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused()
        await standardCharacterAutocomplete(focusedValue, interaction)
    },
    callback: async (interaction, _, originalInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        const characterName = originalInteraction.options.getString("personaggio")

        if (!(await userHasCharacter(interaction.user.id, characterName))) {
            await interaction.editReply({ content: `Errore: non esiste il personaggio '${characterName}` })
            return
        }

        const character = await getCharacter(characterName)
        const calledByAdmin = await isAdmin(interaction.user.id)

        let files = []
        let embeds = []

        const embed = new EmbedBuilder()
            .setTitle(character.name)
            .setDescription(
                `Razza: ${character.race}\n
STR: ${character.strength}
DEX: ${character.dexterity}
CON: ${character.constitution}
INT: ${character.intelligence}
WIS: ${character.winsdom}
CHA: ${character.charisma}
${calledByAdmin ? `\nProprietario: <@${character.user}>\n` : ""}
_${character.description ?? "Nessuna descrizione fornita"}_`)

        if (character.picture) {
            const profileImageFile = new AttachmentBuilder(character.picture.buffer)
                .setName("picture.webp")
            embed.setImage('attachment://picture.webp')
            files.push(profileImageFile)
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