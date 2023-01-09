import { SlashCommandBuilder } from "discord.js"
import { Character, createCharacter, Races } from "../characters.js"
import { Command } from "../flow.js"

const abilityChoices = Array.from(Array(20).keys())
    .reverse()
    .map(el => el + 1)
    .map(el => el.toString())

const command: Command = {
    builder: new SlashCommandBuilder()
        .setName("crea")
        .setDescription("Crea un nuovo personaggio")
        .addStringOption(option =>
            option.setName("nome")
                .setDescription("Il nome completo del nuovo personaggio")
                .setRequired(true)),
    steps: [
        { name: "description", type: "input", prompt: ["Inserisci una descrizione del personaggio"] },
        { name: "race", type: "choice", options: Races, prompt: "Scegli la razza del personaggio" },

        { name: "strength", type: "choice", options: abilityChoices, prompt: "Scegli il punteggio di forza del personaggio" },
        { name: "dexterity", type: "choice", options: abilityChoices, prompt: "Scegli il punteggio di destrezza del personaggio" },
        { name: "constitution", type: "choice", options: abilityChoices, prompt: "Scegli il punteggio di costituzione del personaggio" },
        { name: "intelligence", type: "choice", options: abilityChoices, prompt: "Scegli il punteggio di intelligenza del personaggio" },
        { name: "winsdom", type: "choice", options: abilityChoices, prompt: "Scegli il punteggio di saggezza del personaggio" },
        { name: "charisma", type: "choice", options: abilityChoices, prompt: "Scegli il punteggio di carisma del personaggio" },
    ],
    callback: async (interaction, data, originalInteraction) => {

        const characterName = originalInteraction.options.getString("nome")

        const character: Partial<Character> = {
            name: characterName,
            race: data.race,
            strength: Number.parseInt(data.strength),
            dexterity: Number.parseInt(data.dexterity),
            constitution: Number.parseInt(data.constitution),
            intelligence: Number.parseInt(data.intelligence),
            winsdom: Number.parseInt(data.winsdom),
            charisma: Number.parseInt(data.charisma),
            description: data.description[0],
            inventory: [],
            user: interaction.user.id
        }
        try {
            await createCharacter(character)
            interaction.followUp({ content: `${character.name} creato correttamente!\n**Lo sai?** puoi inviarmi un'immagine in chat privata per aggiungerla come immagine di profilo!`, ephemeral: true })
        } catch (e) {
            interaction.followUp({ content: `Errore: ${e.message}!`, ephemeral: true })
        }
    }
}
export default command