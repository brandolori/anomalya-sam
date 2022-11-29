import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js"
import { TOKEN, CLIENT_ID } from "./common.js"

const client = new Client({
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

const guild = await client.guilds.fetch("1044166056031297616")
const member = await guild.members.fetch("299226752272564224")
const a = member.roles.cache.has("1046812939774087218")
console.log(a)
