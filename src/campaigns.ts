import { isAdmin } from "./core.js"
import { campaigns, IndexCharacter, players } from "./database.js"

type Campaign = {
    name: string
    description: string,
    characters: IndexCharacter[]
}

const createCampaign = async (name: string, description: string) => {
    if ((await campaigns.countDocuments({ name })) > 0)
        throw new Error(`Campagna '${name}' già esistente! Prova con un'altro nome`)

    return campaigns.insertOne({ name, description })
}

const getCampaigns = async () => {
    const response = campaigns.find({}, { projection: { _id: false, name: true } }).toArray()

    return response as unknown as Campaign[]
}

const getPlayerCampaigns = async (userId: string) => {
    const response = await players.findOne({ id: userId }, { projection: { _id: false, campaigns: true } })

    return response?.campaigns as unknown as string[]
}

const addCampaignToPlayer = async (campaignId: string, userId: string) => {
    const response = await players.updateOne({ userId: userId },
        {
            $push:
            {
                campaigns: campaignId
            }
        })

    return response
}

const getCampaign = async (campaignName: string) => {
    const response = campaigns.findOne({ name: campaignName })

    return response as unknown as Campaign
}

const checkCampaignExists = async (campaignName: string) => {
    return (await campaigns.count({ name: campaignName })) > 0
}

const addCharacterToCampaign = async (characterName: string, ownerUser: string, campaignName: string) => {
    return campaigns.updateOne({ name: campaignName },
        {
            $push:
            {
                characters:
                {
                    user: ownerUser,
                    name: characterName
                }
            }
        })
}

const playerHasCampaign = async (userId: string, campaignName: string) => {
    if (isAdmin(userId))
        return (await campaigns.countDocuments({ name: campaignName }))

    const playerCampaings = await getPlayerCampaigns(userId)

    return playerCampaings?.includes(campaignName)
}

export { createCampaign, getCampaigns, checkCampaignExists, addCharacterToCampaign, getCampaign, getPlayerCampaigns, addCampaignToPlayer, playerHasCampaign }