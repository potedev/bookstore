import { UsernamePasswordInput } from "src/resolvers/usernamePasswordInput"

export const validateRegsiter = (options: UsernamePasswordInput) => {
    if (options.username.length <= 2) {
        return [
            {
                field: 'username',
                message: 'Length must be greater than 2'
            }
        ]
    }

    if (options.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'Cannot include an @'
            }
        ]
    }

    if (options.password.length <= 2) {
        return [
            {
                field: 'password',
                message: 'Length must be greater than 2'
            }
        ]
    }

    //Todo valide with a better way our email :)
    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'Invalid email'
            }
        ]
    }

    return null
}