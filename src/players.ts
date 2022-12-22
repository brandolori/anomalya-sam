import { players } from "./database.js"

type Player = {
    userId: string
    campaigns: string[],
}

const createPlayer = async (userId: string) => {

    return players.insertOne({ userId })
}


const getPlayer = async (userId: string) => {
    const response = players.findOne({ userId })

    return response as unknown as Player
}

export { getPlayer, createPlayer }