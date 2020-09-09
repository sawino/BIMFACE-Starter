export default class FormValidator {
    static getUserNameValidators() {
        return [
            { type: 'string', required: true, message: 'Please input name', trigger: 'blur' },
            { min: 4, max: 12, message: 'Length should be between 4 and 12', trigger: 'blur' },
            { pattern: /^[A-Za-z0-9]+$/, message: 'Need English characters and digits', trigger: ['change', 'blur'] }
        ]
    }

    static getEmailValidators() {
        return [
            { type: 'email', required: true, message: 'Invalid email', trigger: 'blur' }
        ]
    }

    static getPasswordValidators() {
        return [
            { type: 'string', required: true, message: 'Please input password', trigger: 'blur' },
            { min: 8, max: 20, message: 'Length should be between 8 and 20', trigger: 'blur' },
            { pattern: /^[A-Za-z0-9!@#$.]+$/, message: 'Need English characters, digits and !@#$.', trigger: ['change', 'blur'] }
        ]
    }
}