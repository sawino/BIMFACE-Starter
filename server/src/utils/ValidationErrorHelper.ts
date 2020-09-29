import {ValidationError} from 'class-validator'

export default class ValidationErrorHelper {
    public static getFirstErrorMessage(errors: ValidationError[]): string {
        if (errors.length === 0) {
            return ''
        }
        
        let firstError = errors[0]
        return 'Validation failed, property name: ' + firstError.property + '. Details: ' + JSON.stringify(firstError.constraints)
    }
}