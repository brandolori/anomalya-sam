const CLIENT_ID = process.env.DEV ? "1044165031564169257" : "1051786709647507496"

const TOKEN = process.env.DEV ? "MTA0NDE2NTAzMTU2NDE2OTI1Nw.GWtAJi.mFNEt1s2nBsgXAPXH8MbDmkfj6HKTSPPg9Wzao" : "MTA1MTc4NjcwOTY0NzUwNzQ5Ng.G92wLi.1nZ2KRIB2xX5MPARxmGA0tZh7emWvYnwPzAOZM"

const GUILD_ID = process.env.DEV ? "1044166056031297616" : "1045644665430474762"

const ADMIN_ROLE_ID = process.env.DEV ? "1046812939774087218" : "1045764551251075084"

const CARRY_CAPACITY_MESSAGE = "_Nell'eterna sfida tra l'avventuriero ed il suo equipaggiamento, questa volta ha vinto l'equipaggiamento! Il tuo zaino rimane fisso a terra, come se qualcuno l'avesse riempito di inutili sassi!_"

const Money = [
    { name: "Monete d'oro", value: "gp" },
    { name: "Monete d'argento", value: "sp" },
    { name: "Monete di bronzo", value: "bp" }
]

export { CLIENT_ID, TOKEN, GUILD_ID, ADMIN_ROLE_ID, Money, CARRY_CAPACITY_MESSAGE }