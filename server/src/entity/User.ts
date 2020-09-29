import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm'
import File from './File'
import BaseEntity from './BaseEntity'
import FileCustomData from './FileCustomData'
import {Length, Validate, IsAlphanumeric, IsEmail, IsEnum} from 'class-validator'
import Roles from '../common/Roles'
import PasswordValidator from '../validators/PasswordValidator'
@Entity()
export default class User extends BaseEntity {

    @Column()
    @IsAlphanumeric()
    @Length(4, 12, {
        message: 'User name length should be between 4 and 12'
    })
    name: string;

    @Column({select: false})
    @Validate(PasswordValidator)
    @Length(8, 20)
    password: string

    @Column()
    @IsEmail()
    email: string;

    @OneToMany(type => FileCustomData, fileCustomData => fileCustomData.user)
    fileCustomDataArray: FileCustomData[]

    @OneToMany(type => File, file => file.user)
    files: File[]

    @Column()
    @IsEnum(Roles)
    role: string
}