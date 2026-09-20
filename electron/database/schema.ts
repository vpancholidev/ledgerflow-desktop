import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const appSettings = sqliteTable('app_settings', {
    key: text('key').primaryKey(),
    value: text('value').notNull()
});

export const customers = sqliteTable('customers', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    address: text('address'),
    idProof: text('id_proof'),
    notes: text('notes'),
    documents: text('documents', { mode: 'json' }).$type<string[]>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const transactions = sqliteTable('transactions', {
    id: text('id').primaryKey(),
    customerId: text('customer_id').notNull(),
    type: text('type').notNull(), // 'credit' | 'debit'
    amount: real('amount').notNull(),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    desc: text('desc').notNull(),
    isSystem: integer('is_system', { mode: 'boolean' }).default(false)
});
