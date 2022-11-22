import { ActionRowBuilder, AutocompleteInteraction, CacheType, ChatInputCommandInteraction, Interaction, ModalBuilder, SelectMenuBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { v4 } from "uuid"
import { client, registerCommands } from "./mud.js"

const timeout = 120_000

type Step = { name: string, prompt: string } &
    ({
        type: "input",
    }
        |
    {
        type: "choice",
        options: any
    })

type Command = {
    builder: any,
    callback: (interaction: ChatInputCommandInteraction, data?: any, originalInteraction?: ChatInputCommandInteraction) => void,
    steps?: Step[],
    autocomplete?: (interaction: AutocompleteInteraction) => void,
}

const registerFlows = (...commands: Command[]) => {

    registerCommands(commands.map(el => el.builder))

    commands.forEach(command => {

        client.on('interactionCreate', async interaction => {
            try {
                let responses = {}
                if (interaction.isChatInputCommand()) {

                    if (interaction.commandName === command.builder.name) {

                        let rollingInteraction = interaction
                        for (const step of command.steps ?? []) {

                            if (step.type == "input") {
                                const { data, interaction: newInteraction } = await requestInput(rollingInteraction, step.prompt)
                                responses[step.name] = data
                                rollingInteraction = newInteraction
                            } else if (step.type == 'choice') {
                                const { data, interaction: newInteraction } = await requestChoice(rollingInteraction, step.options, step.prompt)
                                responses[step.name] = data
                                rollingInteraction = newInteraction
                            }
                        }

                        command.callback(rollingInteraction, responses, interaction)
                    }
                } else if (interaction.isAutocomplete()) {
                    if (interaction.commandName === command.builder.name) {
                        command.autocomplete(interaction)
                    }
                }
            } catch (e) { console.log(`Flow interrupted: ${e}`) }
        })
    })

}

const requestInput = (interaction, prompt: string) => {

    const modalId = v4()
    const inputId = v4()

    showInput(interaction, modalId, inputId, prompt)
    return getInputResponse(modalId, inputId)
}

const showInput = async (interaction: any, modalId: string, inputId: string, prompt: string) => {
    console.log("show modal")
    const modal = new ModalBuilder()
        .setCustomId(modalId)
        .setTitle("Inserisci")

    const nameInput = new TextInputBuilder()
        .setCustomId(inputId)
        .setLabel(prompt)
        .setStyle(TextInputStyle.Short)

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput)

    modal.addComponents(firstActionRow)

    await interaction.showModal(modal)
}

const getInputResponse = (modalId: string, inputId: string) => {

    return new Promise<any>((res, rej) => {

        const modalSubmitAction = async (interaction: Interaction) => {
            if (interaction.isModalSubmit() && interaction.customId === modalId) {
                console.log("submit modal")
                const name = interaction.fields.getTextInputValue(inputId)
                client.off("interactionCreate", modalSubmitAction)
                await interaction.reply({ content: `Hai inserito: ${name}`, ephemeral: true })
                res({ data: name, interaction })
            }
        }

        client.on("interactionCreate", modalSubmitAction)

        setTimeout(() => {
            client.off("interactionCreate", modalSubmitAction)
            rej("timeout")
        }, timeout)
    })
}

const requestChoice = (interaction, choices: string[], prompt: string) => {
    const choiceId = v4()

    showChoice(interaction, choiceId, choices, prompt)
    return getChoiceResponse(choiceId)
}

const showChoice = async (interaction, choiceId: string, choices: string[], prompt: string) => {
    console.log("show choice")
    const row = new ActionRowBuilder<SelectMenuBuilder>()
        .addComponents(
            new SelectMenuBuilder()
                .setCustomId(choiceId)
                .addOptions(
                    choices.map(el => ({
                        label: el,
                        value: el
                    }))
                ),
        )

    const reply = { content: prompt, ephemeral: true, components: [row] }
    if (interaction.replied)
        interaction.followUp(reply)
    else
        interaction.reply(reply)
}

const getChoiceResponse = (choiceId: string) => {

    return new Promise<any>((res, rej) => {

        const choiceSubmitAction = async (interaction) => {
            if (interaction.isSelectMenu() && interaction.customId === choiceId) {
                console.log("submit choice")
                const choice = interaction.values[0]
                await interaction.update({ content: `Hai scelto: ${choice}`, components: [] })
                client.off("interactionCreate", choiceSubmitAction)
                res({ data: choice, interaction })
            }
        }
        client.on("interactionCreate", choiceSubmitAction)

        setTimeout(() => {
            client.off("interactionCreate", choiceSubmitAction)
            rej("timeout")
        }, timeout)
    })
}

export { registerFlows }