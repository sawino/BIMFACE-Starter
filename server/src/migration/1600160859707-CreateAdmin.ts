import {MigrationInterface, QueryRunner, getManager} from "typeorm";
import User from '../entity/User'
import * as argon2 from 'argon2'
import Roles from '../common/Roles'

export class CreateAdmin1600160859707 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        let user = new User();
        user.name = 'admin'
        user.password = await argon2.hash('changeme')
        user.email = 'changeme@changeme.com'
        user.role = Roles.Admin
        await getManager().save(user)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
