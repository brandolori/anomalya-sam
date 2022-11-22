import { DataTypes, Model, Sequelize } from 'sequelize'

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './data/database.sqlite',
    logging: false
})

await sequelize.authenticate()

class Character extends Model {
    name?: string
    race?: typeof races[number]
}

Character.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    race: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { sequelize })

await sequelize.sync()

const races = ["nano", "elfo"] as const

const getUserCharacters = (user: string) => {
    return Character.findAll({
        where: {
            user: user
        }
    })
}

const removeCharacter = (user: string, name: string) => {
    return Character.destroy({
        where: {
            user: user,
            name: name
        }
    })
}

const createCharacter = (user: string, character: Character) => {
    Character.create({
        name: character.name,
        race: character.race,
        user: user
    })
}

export { races, getUserCharacters, removeCharacter, createCharacter, Character }
