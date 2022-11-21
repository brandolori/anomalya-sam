import { SlashCommandBuilder } from 'discord.js'
import { registerFlows } from './flow.js'

const races = ["nano", "elfo"] as const

type Character = {
    name?: string,
    race?: typeof races[number]
}

const throwDice = (dice: number, diceAmount: number) => {
    return
}

registerFlows({
    builder: new SlashCommandBuilder()
        .setName("crea")
        .setDescription("Crea un nuovo personaggio"),
    steps: [
        { name: "name", type: "input", prompt: "Inserisci il nome del personaggio" },
        { name: "race", type: "choice", options: races, prompt: "Scegli la classe del personaggio" },
    ],
    callback: (_, data) => {
        const character = data as Character
        console.log(character)
    }
},
    {
        builder: new SlashCommandBuilder()
            .setName("tira")
            .setDescription("Tira uno o più dadi")
            .addStringOption(option =>
                option.setName("dadi")
                    .setDescription("I dadi ta tirare")
                    .setRequired(true))
            .addStringOption(option =>
                option.setName("vantaggio")
                    .setDescription("Tirare con vantaggio o svantaggio?")
                    .setChoices(
                        { name: "vantaggio", value: "advantage" },
                        { name: "svantaggio", value: "disadvantage" }
                    )
            ),
        callback: (interaction) => {

            const dice = interaction.options.getString("dadi")
            const adv = interaction.options.getString("dadi")
            console.log(dice)

            const cleanedDice = dice.replace(" ", "").toLowerCase()
            const groups = cleanedDice.replace("-", "+-").split("+")
            let total = 0
            let totalString = ""
            let first = true
            groups.forEach(el => {

                // if it's a modifier
                if (!el.includes("d")) {
                    const modifier = Number.parseInt(el)
                    total += modifier
                    totalString = `${totalString} ${(modifier < 0 ? "-" : "+")} ${Math.abs(modifier)} (mod)`
                } else {
                    const [diceAmountString, diceString] = el.split("d")
                    const diceAmount = Number.parseInt(diceAmountString)
                    const dice = Number.parseInt(diceString)

                    for (let i = 0; i < diceAmount; i++) {
                        const singleValue = Math.ceil(Math.random() * dice)
                        total += singleValue
                        totalString = `${totalString}${first ? "" : " + "}${singleValue} (d${dice})`
                        first = false
                    }

                }
            })
            interaction.reply(`Hai tirato ${cleanedDice}\nComponenti: ${totalString}\nRisultato: ${total}`)
        }
    })
