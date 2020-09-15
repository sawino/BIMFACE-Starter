import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from 'typeorm'
import User from './User'
import BaseEntity from "./BaseEntity"
import FileCustomData from './FileCustomData'

@Entity()
export default class File extends BaseEntity {

    @Column()
    name: string

    @Column()
    status: string

    @Column()
    fileId: string

    @Column({
        default: ""
    })
    alias: string

    @ManyToOne(type => User, user => user.files)
    user: User

    @OneToMany(type => FileCustomData, fileCustomData => fileCustomData.file)
    fileCustomDataArray: FileCustomData[]
}