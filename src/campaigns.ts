import { campaigns, IndexCharacter } from "./database.js"

type Campaign = {
    name: string
    description: string,
    characters: IndexCharacter[]
}

const createCampaign = async (name: string, description: string) => {
    if ((await campaigns.countDocuments({ name })) > 0)
        throw new Error(`Campagna '${name}' già esistente! Prova con un'altro nome`)

    return campaigns.insertOne({ name, description, characters: [] })
}

const getCampaigns = async () => {
    const response = campaigns.find({}, { projection: { _id: false, name: true } }).toArray()

    return response as unknown as Campaign[]
}

const getCampaign = async (campaignName: string) => {
    const response = campaigns.findOne({ name: campaignName }, { projection: { _id: false, name: true } })

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

export { createCampaign, getCampaigns, checkCampaignExists, addCharacterToCampaign, getCampaign }