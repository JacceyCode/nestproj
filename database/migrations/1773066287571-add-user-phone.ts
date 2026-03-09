import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPhone1773066287571 implements MigrationInterface {
    name = 'AddUserPhone1773066287571'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
    }

}
