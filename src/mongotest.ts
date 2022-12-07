import pkg from 'mongodb'
const { MongoClient } = pkg


// Replace the uri string with your connection string.
const uri =
    "mongodb://127.0.0.1:27017"
const client = new MongoClient(uri, { useUnifiedTopology: true })
await client.connect()
const database = client.db('anomalya')
const equipment = database.collection('equipment')
const characters = database.collection('characters')

const a = await characters.aggregate([
    {
        $match: {
            name: "Jhon"
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
        $unwind: "$inventory"
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
    },
]).toArray()

const b = await equipment.findOne({ index: "handaxe" })

client.close()

console.log(a[1])
// console.log(b)

