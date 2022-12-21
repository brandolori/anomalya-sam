import { SlashCommandBuilder } from "discord.js"
import { isAdmin } from "../core.js"
import { getCampaigns, standardCharacterAutocomplete } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("uniscipersonaggio")
        .setDescription("Unisci un personaggio ad una campagna")
        .addStringOption(option =>
            option.setName("personaggio")
                .setDescription("Il personaggio da aggiungere alla campagna")
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option =>
            option.setName("campagna")
                .setDescription("La campagna a cui aggiungere il personaggio")
                .setAutocomplete(true)
                .setRequired(true)),
    autocomplete: async (interaction) => {

        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === "personaggio") {
            const focusedValue = focusedOption.value
            await standardCharacterAutocomplete(focusedValue, interaction)
        } else if (focusedOption.name === "campagna") {
            try {
                const focusedValue = focusedOption.value
                const choices = (await getCampaigns()).map(el => el.name).slice(0, 24)
                const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
                await interaction.respond(
                    filtered.map(choice => ({ name: choice, value: choice })),
                )
            } catch (e) { }
        }
    },
    callback: async (interaction, _, originalInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        if (!isAdmin(interaction.user.id)) {
            await interaction.editReply({ content: `Oooops! Questo comando è solo per i DM` })
            return
        }

        await interaction.editReply({ content: `Jaaa` })
    }
}
export default command