import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import parse from 'csv-parse/lib/sync';

import AppError from '../errors/AppError';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionRequest {
  title: string;
  type: 'income' | 'outcome';
  value: string;
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const fileWithPath = path.join(uploadConfig.directory, filename);
    const content = await promisify(fs.readFile)(fileWithPath);

    const records: TransactionRequest[] = parse(content, {
      trim: true,
      columns: true,
    });

    if (records.length < 1) {
      throw new AppError('The CSV file is empty');
    }

    const createTransaction = new CreateTransactionService();

    const transactions: Transaction[] = [];

    for (const record of records) {
      const transaction = await createTransaction.execute({
        title: record.title,
        type: record.type,
        category: record.category,
        value: Number(record.value),
      });
      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
