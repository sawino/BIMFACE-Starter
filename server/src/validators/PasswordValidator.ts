import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator'

@ValidatorConstraint({name: 'General', async: false})
export default class PasswordValidator implements ValidatorConstraintInterface {
    validate(value: string, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
        let regExp = new RegExp(/^[A-Za-z0-9!@#$.]+$/);
        return regExp.test(value)
    }

    defaultMessage?(validationArguments?: ValidationArguments): string {
        return 'Password should be English characters, digits and !@#$.'
    }
    
}