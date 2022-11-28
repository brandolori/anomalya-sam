import { SlashCommandBuilder } from "discord.js"
import { Command } from "../flow.js"

const throwDice = (dice: number) => Math.ceil(Math.random() * dice)

const command: Command = {
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
        const adv = interaction.options.getString("vantaggio")

        const cleanedDice = dice.replace(" ", "").toLowerCase()
        const groups = cleanedDice.replace("-", "+-").split("+")
        let total = 0
        let totalString = ""
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

                if (dice == 20 && diceAmount == 1 && adv) {
                    const first = throwDice(dice)
                    const second = throwDice(dice)

                    totalString = `${totalString}${total == 0 ? "" : " + "}[${first}, ${second}]`
                    total += adv == "advantage"
                        ? Math.max(first, second)
                        : Math.min(first, second)
                } else {
                    for (let i = 0; i < diceAmount; i++) {
                        const singleValue = throwDice(dice)
                        totalString = `${totalString}${total == 0 ? "" : " + "}${singleValue} (d${dice})`
                        total += singleValue
                    }
                }
            }
        })
        interaction.reply(`Hai tirato ${cleanedDice}\nComponenti: ${totalString}\nRisultato: ${total}`)
    }
}
export default command