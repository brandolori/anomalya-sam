import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } from "discord.js"
import { TOKEN, CLIENT_ID, GUILD_ID, ADMIN_ROLE_IDS } from "./common.js"

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

client.setMaxListeners(0)

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
    return ADMIN_ROLE_IDS.some(role => member.roles.cache.has(role))
}

const getEventListenersCount = () => client.eventNames().map(el => client.listenerCount(el)).reduce((prev, curr) => prev + curr, 0)

export { client, registerCommands, isAdmin, getEventListenersCount }