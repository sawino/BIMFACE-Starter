import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm'
import BaseEntity from "./BaseEntity"
import File from './File'
import User from './User'

@Entity()
export default class FileCustomData extends BaseEntity {

    @Column()
    fileId: string

    @Column({type: "longtext"})
    content: string

    @Column({
        default: ""
    })
    name: string

    @ManyToOne(type => User, user => user.fileCustomDataArray)
    user: User

    @ManyToOne(type => File, file => file.fileCustomDataArray)
    file: File
}