import { GuildMember } from "discord.js"

const CLIENT_ID = "1044165031564169257"

const TOKEN = "MTA0NDE2NTAzMTU2NDE2OTI1Nw.GWtAJi.mFNEt1s2nBsgXAPXH8MbDmkfj6HKTSPPg9Wzao"

const isAdmin = (member: GuildMember) => member.roles.cache.has("1046812939774087218")


export { CLIENT_ID, TOKEN, isAdmin }