import { ActionRowBuilder, AutocompleteInteraction, ChatInputCommandInteraction, Interaction, ModalBuilder, ModalSubmitInteraction, SelectMenuBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from "discord.js"
import { v4 } from "uuid"
import { client, registerCommands } from "./core.js"

const timeout = 120_000

type Step = { name: string, } &
    ({
        type: "input",
        prompt: string[]
    }
        |
    {
        type: "choice",
        options: string[],
        prompt: string
    })

export type Command = {
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
                        console.log(`[${new Date().toISOString()}] ${interaction.user.username} ha chiamato /${interaction.commandName}`)
                        let rollingInteraction: any = interaction
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

const requestInput = async (interaction, prompts: string[]) => {

    const modalId = v4()

    const inputGuids = await showInput(interaction, modalId, prompts)
    return getInputResponse(modalId, inputGuids)
}

const showInput = async (interaction: any, modalId: string, prompts: string[]) => {

    const modal = new ModalBuilder()
        .setCustomId(modalId)
        .setTitle("Inserisci")

    const inputGuids = prompts.map(prompt => {

        const inputId = v4()

        const nameInput = new TextInputBuilder()
            .setCustomId(inputId)
            .setLabel(prompt)
            .setStyle(TextInputStyle.Short)

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput)

        modal.addComponents(firstActionRow)

        return inputId
    })

    await interaction.showModal(modal)

    return inputGuids
}

const getInputResponse = (modalId: string, inputIds: string[]) => {

    return new Promise<{ data: string[], interaction: ModalSubmitInteraction }>((res, rej) => {

        const modalSubmitAction = async (interaction: Interaction) => {
            if (interaction.isModalSubmit() && interaction.customId === modalId) {

                const data = inputIds.map(el => interaction.fields.getTextInputValue(el))
                client.off("interactionCreate", modalSubmitAction)
                await interaction.reply({ content: `Hai inserito: '${data.join("'\n'")}'`, ephemeral: true })
                res({ data, interaction })
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

    return new Promise<{ data: string, interaction: SelectMenuInteraction }>((res, rej) => {

        const choiceSubmitAction = async (interaction: Interaction) => {
            if (interaction.isSelectMenu() && interaction.customId === choiceId) {
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

export { registerFlows, requestChoice }