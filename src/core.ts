import { Client, GatewayIntentBits, GuildMember, REST, Routes, SlashCommandBuilder } from "discord.js"
import { TOKEN, CLIENT_ID } from "./common.js"

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.login(TOKEN)

const registerCommands = async (commands: SlashCommandBuilder[]) => {

    const commandList = commands.map(el => el.toJSON())

    const rest = new REST({ version: '10' }).setToken(TOKEN)

    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandList })
        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }
}

export { client, registerCommands }