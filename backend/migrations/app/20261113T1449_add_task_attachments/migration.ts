#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/87e94e9c6e42dc014ed3854fbb761c9cf11b7bf59eadacd6bed8c9dcbdf407d8/contract';
import endContract from '../../snapshots/87e94e9c6e42dc014ed3854fbb761c9cf11b7bf59eadacd6bed8c9dcbdf407d8/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/bc06c90feda1a0a7d7bca1df26878ca49da978ec8657947ca4c11ddc98eea521/contract';
import startContract from '../../snapshots/bc06c90feda1a0a7d7bca1df26878ca49da978ec8657947ca4c11ddc98eea521/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'TaskAttachment',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 3 } },
          }),
          col('fileName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fileSize', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('fileType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fileUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('taskId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TaskAttachment',
        foreignKey: {
          name: 'TaskAttachment_taskId_fkey',
          columns: ['taskId'],
          references: { schema: 'public', table: 'Task', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
