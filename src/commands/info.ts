import { SlashCommandBuilder } from "discord.js"
import { getEventListenersCount, isAdmin } from "../core.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Informazioni sul bot"),
    callback: async (interaction) => {

        await interaction.deferReply({ ephemeral: true })
        const info = {
            version: process.env.npm_package_version,
            env: process.env.DEV ? "DEV" : "PROD",
            userIsAdmin: isAdmin(interaction.user.id),
            eventListeners: getEventListenersCount()
        }

        const infoString = Object.entries(info).map(el => `${el[0]}: ${el[1]}`).join("\n")

        interaction.editReply(`Ciao! Sono Sam.\nEcco qualche info utile:\n\n${infoString}`)
    }
}
export default command