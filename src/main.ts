import { SlashCommandBuilder } from 'discord.js'
import { addToInventory, Character, createCharacter, getAllCharacters, getEquipmentData, getEquipmentNames, getUserCharacters, races, removeCharacter } from './data.js'
import { registerFlows } from './flow.js'

const throwDice = (dice: number) => Math.ceil(Math.random() * dice)

registerFlows(
    {
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
    },
    {
        builder: new SlashCommandBuilder()
            .setName("personaggi")
            .setDescription("Mostra tutti i tui personaggi"),
        callback: async (interaction) => {
            const userCharacters = await getUserCharacters(interaction.user.id)
            const userCharactersString = userCharacters.map(el => `Nome: ${el.name}\nRazza: ${el.race}`).join("\n\n")
            interaction.reply({ content: `Trovati ${userCharacters.length} personaggi${userCharacters.length > 0 ? ":" : ""}\n\n${userCharactersString}`, ephemeral: true })
        }
    },
    {
        builder: new SlashCommandBuilder()
            .setName("elimina")
            .setDescription("Elimina un personaggio")
            .addStringOption(option =>
                option.setName("personaggio")
                    .setDescription("Il personaggio da eliminare")
                    .setAutocomplete(true)
                    .setRequired(true)
            ),
        autocomplete: async (interaction) => {
            const focusedValue = interaction.options.getFocused()
            const choices = (await getUserCharacters(interaction.user.id)).map(el => el.name)
            const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
            interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            )
        },
        steps: [
            { name: "name", type: "input", prompt: "Conferma il nome del pg" },
        ],
        callback: async (interaction, data, originalInteraction) => {
            const originalName = originalInteraction.options.getString("personaggio")
            const confirmName = data.name

            if (!(await getUserCharacters(interaction.user.id)).find(el => el.name == originalName)) {
                await interaction.followUp({ content: `Eliminazione non andata a buon fine: nessun personaggio trovato con questo nome`, ephemeral: true })
                return
            }

            if (originalName == confirmName) {
                await removeCharacter(originalName)

                interaction.followUp({ content: `${originalName} eliminato correttamente`, ephemeral: true })
            } else {
                interaction.followUp({ content: `Eliminazione non andata a buon fine: il nome inserito non corrisponde`, ephemeral: true })
            }
        }
    },
    {
        builder: new SlashCommandBuilder()
            .setName("oggetti")
            .setDescription("Visualizza informazioni su un oggetto")
            .addStringOption(option =>
                option.setName("oggetto")
                    .setDescription("L'oggetto di cui visualizzare le informazioni")
                    .setAutocomplete(true)
                    .setRequired(true)
            ),
        autocomplete: async (interaction) => {
            const focusedValue = interaction.options.getFocused()
            const choices = (await getEquipmentNames()).slice(0, 24)
            const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
            interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            )
        },
        callback: async (interaction, _, originalInteraction) => {
            const name = originalInteraction.options.getString("oggetto")
            const eqData = await getEquipmentData(name)

            if (eqData) {
                await interaction.reply({ content: `Informazioni su ${eqData.name}:\nCosto: ${eqData.cost.quantity} ${eqData.cost.unit}\nPeso: ${eqData.weight} lbs`, ephemeral: true })
            }
            else {
                await interaction.reply({ content: `Nessun oggetto trovato con il nome di ${name}! Sei sicuro di aver scritto bene?`, ephemeral: true })
            }

        }
    },
    {
        builder: new SlashCommandBuilder()
            .setName("raccogli")
            .setDescription("Aggiungi un elemento all'inventario del personaggio")
            .addStringOption(option =>
                option.setName("personaggio")
                    .setDescription("Il personaggio a cui dare l'oggetto")
                    .setAutocomplete(true)
                    .setRequired(true))
            .addStringOption(option =>
                option.setName("oggetto")
                    .setDescription("L'oggetto da inserire nell'inventario")
                    .setAutocomplete(true)
                    .setRequired(true)
            ),
        autocomplete: async (interaction) => {

            const focusedOption = interaction.options.getFocused(true)

            if (focusedOption.name === "personaggio") {
                const focusedValue = focusedOption.value
                const choices = (await getAllCharacters()).map(el => el.name)
                const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
                interaction.respond(
                    filtered.map(choice => ({ name: choice, value: choice })),
                )
            } else if (focusedOption.name === "oggetto") {
                const focusedValue = focusedOption.value
                const choices = (await getEquipmentNames()).slice(0, 24)
                const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
                interaction.respond(
                    filtered.map(choice => ({ name: choice, value: choice })),
                )
            }
        },
        callback: async (interaction, _, originalInteraction) => {
            const oggetto = originalInteraction.options.getString("oggetto")
            const personaggio = originalInteraction.options.getString("personaggio")
            await addToInventory(personaggio, oggetto, 1)

            await interaction.reply({ content: `Operazione completata con successo!`, ephemeral: true })
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
    })
