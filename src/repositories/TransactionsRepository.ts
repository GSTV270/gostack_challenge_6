import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const incomeArray = transactions.filter(
      transaction => transaction.type !== 'outcome',
    );
    const income =
      incomeArray.length < 1
        ? 0
        : incomeArray
            .map(transaction => transaction.value)
            .reduce((sum, transaction) => sum + transaction);

    const outcomeArray = transactions.filter(
      transaction => transaction.type !== 'income',
    );

    const outcome =
      outcomeArray.length < 1
        ? 0
        : outcomeArray
            .map(transaction => transaction.value)
            .reduce((sum, transaction) => sum + transaction);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
