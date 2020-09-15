import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFileStatus1600162007526 implements MigrationInterface {
    name = 'AddFileStatus1600162007526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `file` CHANGE `isTranslated` `status` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `file` DROP COLUMN `status`");
        await queryRunner.query("ALTER TABLE `file` ADD `status` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `file` DROP COLUMN `status`");
        await queryRunner.query("ALTER TABLE `file` ADD `status` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `file` CHANGE `status` `isTranslated` tinyint NOT NULL");
    }

}
