#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/56a0b0aa66bcc65a7a55174cc48044cc70e13f0af508aff0d8b19c30879d7413/contract';
import startContract from '../../snapshots/56a0b0aa66bcc65a7a55174cc48044cc70e13f0af508aff0d8b19c30879d7413/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/75846cfd14f5db3f313666f34638cad75a5bc7da12fcaccd57db37606f0bb09c/contract';
import endContract from '../../snapshots/75846cfd14f5db3f313666f34638cad75a5bc7da12fcaccd57db37606f0bb09c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Task',
        column: col('assigneeId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Task',
        column: col('priority', 'text', {
          notNull: true,
          default: lit('Medium'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Task',
        foreignKey: {
          name: 'Task_assigneeId_fkey',
          columns: ['assigneeId'],
          references: { schema: 'public', table: 'TeamMember', columns: ['id'] },
          onDelete: 'setNull',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
