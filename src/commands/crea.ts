import { SlashCommandBuilder } from "discord.js"
import { Character, createCharacter, races } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("crea")
        .setDescription("Crea un nuovo personaggio"),
    steps: [
        {
            name: "modal", type: "input", prompt: [
                "Nome del personaggio",
                "Forza del personaggio",
            ]
        },
        { name: "race", type: "choice", options: races, prompt: "Scegli la razza del personaggio" },
    ],
    callback: async (interaction, data) => {
        console.log("data2:", data)

        const character: Character = {
            name: data.modal[0],
            race: data.race,
            strenght: Number.parseInt(data.modal[1]),
            inventory: []
        }
        await createCharacter(interaction.user.id, character)

        interaction.followUp({ content: `${character.name} creato correttamente!`, ephemeral: true })
    }
}
export default command