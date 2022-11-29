import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } from "discord.js"
import { TOKEN, CLIENT_ID, GUILD_ID } from "./common.js"

const client = new Client({
    partials: [
        Partials.Channel,
    ],
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ]
})

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

const isAdmin = async (userId: string) => {
    const guild = await client.guilds.fetch(GUILD_ID)
    const member = await guild.members.fetch(userId)
    return member.roles.cache.has("1046812939774087218")
}

export { client, registerCommands, isAdmin }