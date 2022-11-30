import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { isAdmin } from "../core.js"
import { getCharacter, getUserCharacters, userHasCharacter } from "../data.js"
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
        const choices = (await getUserCharacters(interaction.user.id)).map(el => el.name)
        const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )

    },
    callback: async (interaction, _, originalInteraction) => {
        const characterName = originalInteraction.options.getString("personaggio")

        if (!(await userHasCharacter(interaction.user.id, characterName))) {
            await interaction.reply({ content: `Errore: non esiste il personaggio '${characterName}`, ephemeral: true })
            return
        }

        const character = await getCharacter(characterName)
        const calledByAdmin = await isAdmin(interaction.user.id)

        let files = []
        let embeds = []

        if (character.picture) {

            const profileImageFile = new AttachmentBuilder(character.picture.buffer)
                .setName("picture.jpg")
            const profileImageEmbed = new EmbedBuilder()
                .setTitle('Immagine del personaggio')
                .setImage('attachment://picture.jpg')
            files.push(profileImageFile)
            embeds.push(profileImageEmbed)
        }

        await interaction.deferReply({ ephemeral: true })
        await interaction.editReply({
            content: `Nome: ${character.name}
Razza: ${character.race}
STR: ${character.strength}
DEX: ${character.dexterity}
CON: ${character.constitution}
INT: ${character.intelligence}
WIS: ${character.winsdom}
CHA: ${character.charisma}
${calledByAdmin ? `Proprietario: <@${character.user}>` : ""}`,
            embeds,
            files
        })
    }
}
export default command