import { SlashCommandBuilder } from "discord.js"
import { Character, createCharacter, races } from "../data.js"
import { Command } from "../flow.js"

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("crea")
        .setDescription("Crea un nuovo personaggio"),
    steps: [
        { name: "name", type: "input", prompt: "Inserisci il nome del personaggio" },
        { name: "race", type: "choice", options: races, prompt: "Scegli la razza del personaggio" },
    ],
    callback: async (interaction, data: Character) => {
        await createCharacter(interaction.user.id, data)

        interaction.followUp({ content: `${data.name} creato correttamente!`, ephemeral: true })
    }
}
export default command