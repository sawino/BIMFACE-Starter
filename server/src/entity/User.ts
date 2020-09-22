import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm'
import File from './File'
import BaseEntity from './BaseEntity'
import FileCustomData from './FileCustomData'

@Entity()
export default class User extends BaseEntity {

    @Column()
    name: string;

    @Column({select: false})
    password: string

    @Column()
    email: string;

    @OneToMany(type => FileCustomData, fileCustomData => fileCustomData.user)
    fileCustomDataArray: FileCustomData[]

    @OneToMany(type => File, file => file.user)
    files: File[]

    @Column()
    role: string
}