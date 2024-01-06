import { AutocompleteInteraction } from "discord.js"
import { getLightCharacter, IndexCharacter } from "./characters.js"
import { isAdmin } from "./core.js"
import { campaigns, players } from "./database.js"

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

const deleteCampaign = async (name: string) => {
    return campaigns.deleteOne({ name })
}

const getAllCampaigns = async () => {
    const response = campaigns.find({}).toArray()

    return (response ?? []) as unknown as Campaign[]
}

const getPlayerCampaigns = async (userId: string) => {
    const response = await players.findOne({ userId }, { projection: { _id: false, campaigns: true } })

    const returnValue = response?.campaigns ?? []

    return returnValue as unknown as string[]
}

const getCharacterCampaigns = async (characterName: string) => {
    const aggregation = await campaigns.aggregate([
        {
            $unwind: "$characters"
        },
        {
            $match: {
                "characters.name": characterName
            }
        },
        {
            $project: {
                _id: false,
                name: true
            }
        }
    ]).toArray() ?? []
    const campaignNames = aggregation.map(el => el.name) as string[]
    return campaignNames
}

const removeCharacterFromCampaignAndUpdatePlayer = async (characterName: string, campaign: Campaign) => {
    await removeCharacterFromCampaign(characterName, campaign.name)

    const character = await getLightCharacter(characterName)

    const playerHasOtherCharactersInCampaign = campaign.characters.filter((el) => el.name != characterName)
        .some((el) => el.user == character.user)

    if (!playerHasOtherCharactersInCampaign) {
        await removeCampaignFromPlayer(campaign.name, character.user)
    }
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

const removeCampaignFromPlayer = async (campaignId: string, userId: string) => {
    const response = await players.updateOne({ userId: userId },
        {
            $pull:
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

const removeCharacterFromCampaign = async (characterName: string, campaignName: string) => {
    return campaigns.updateOne({ name: campaignName },
        {
            $pull:
            {
                characters:
                {
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

const campaignAutocomplete = async (inputValue: string, interaction: AutocompleteInteraction) => {
    try {
        const choices = isAdmin(interaction.user.id)
            ? (await getAllCampaigns()).map(el => el.name)
            : (await getPlayerCampaigns(interaction.user.id)).slice(0, 24)
        const filtered = choices.filter(choice => choice.toLowerCase().includes(inputValue.toLowerCase()))
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        )
    } catch (e) {
        console.log(`timeout autocompletamento in ${interaction.commandName}`)
    }
}

export {
    getCampaign,
    getAllCampaigns,
    createCampaign,
    deleteCampaign,
    checkCampaignExists,
    addCharacterToCampaign,
    getPlayerCampaigns,
    playerHasCampaign,
    removeCharacterFromCampaign,
    addCampaignToPlayer,
    removeCampaignFromPlayer,
    getCharacterCampaigns,
    removeCharacterFromCampaignAndUpdatePlayer,
    campaignAutocomplete
}
