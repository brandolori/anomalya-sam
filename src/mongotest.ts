import { MongoClient } from "mongodb"


// Replace the uri string with your connection string.
const uri =
    "mongodb://127.0.0.1:27017"
const client = new MongoClient(uri)
const database = client.db('test')
const equipment = database.collection('equipment')
const characters = database.collection('characters')

const response = await characters.findOne({ name: "Andrea" }, { projection: { inventory: true } })
const a = await characters.aggregate([
    {
        $match: {
            name: "Batman"
        }
    },
    {
        $project: {
            inventory: {
                $filter: {
                    input: "$inventory",
                    as: "inventory",
                    cond: { $eq: ["$$inventory.location", "zaino"] }
                }
            }
        }
    },
    {
        $lookup: {
            from: "equipment",
            localField: "inventory.equipment",
            foreignField: "index",
            as: "equipmentData"
        }
    },
    {
        $project: {
            _id: false,
            inventory: true,
            equipmentData: true
        }
    }
]).toArray()


client.close()

console.log(a)

