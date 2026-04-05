import { useDeferredValue, useState } from 'react';
import type { Transaction } from '../types/finance';
import { currencyFormatter } from '../utils/finance';
import {
  applyTransactionFilters,
  formatSignedTransactionAmount,
  formatTransactionDateLabel,
  getTransactionCategories,
  summarizeTransactionActivity,
  transactionSortOptions,
  type TransactionCategoryFilter,
  type TransactionFilterType,
  type TransactionSortOption,
} from '../utils/transactions';

type TransactionsSectionProps = {
  transactions: Transaction[];
};

export function TransactionsSection({
  transactions,
}: TransactionsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] =
    useState<TransactionFilterType>('all');
  const [selectedCategory, setSelectedCategory] =
    useState<TransactionCategoryFilter>('all');
  const [sortOption, setSortOption] =
    useState<TransactionSortOption>('latest');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const categories = getTransactionCategories(transactions);
  const visibleTransactions = applyTransactionFilters(transactions, {
    query: deferredSearchTerm,
    type: selectedType,
    category: selectedCategory,
    sort: sortOption,
  });
  const visibleSummary = summarizeTransactionActivity(visibleTransactions);
  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    sortOption !== 'latest';

  function resetFilters() {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSortOption('latest');
  }

  return (
    <section
      className="transactions-panel"
      aria-labelledby="transactions-section-title"
    >
      <div className="transactions-panel__header">
        <div>
          <p className="eyebrow">Transactions</p>
          <h2 id="transactions-section-title">
            Search, filter, and review every movement
          </h2>
          <p className="transactions-panel__copy">
            Explore the ledger by keyword, type, and category without losing the
            broader financial context.
          </p>
        </div>

        <div className="transactions-panel__summary">
          <span className="transactions-panel__summary-label">Visible net</span>
          <strong>{currencyFormatter.format(visibleSummary.net)}</strong>
          <span className="transactions-panel__summary-meta">
            {visibleTransactions.length} of {transactions.length} transactions
          </span>
        </div>
      </div>

      <div className="transactions-toolbar">
        <label className="field">
          <span className="field__label">Search</span>
          <input
            className="field__control"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search description or category"
          />
        </label>

        <label className="field">
          <span className="field__label">Type</span>
          <select
            className="field__control"
            value={selectedType}
            onChange={(event) =>
              setSelectedType(event.target.value as TransactionFilterType)
            }
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Category</span>
          <select
            className="field__control"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value as TransactionCategoryFilter)
            }
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Sort</span>
          <select
            className="field__control"
            value={sortOption}
            onChange={(event) =>
              setSortOption(event.target.value as TransactionSortOption)
            }
          >
            {transactionSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="transactions-meta">
        <div className="transactions-meta__stats">
          <span className="stat-chip stat-chip--income">
            Income {currencyFormatter.format(visibleSummary.income)}
          </span>
          <span className="stat-chip stat-chip--expense">
            Expenses {currencyFormatter.format(visibleSummary.expenses)}
          </span>
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            className="ghost-button"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <p>No transactions available.</p>
          <span>Add data to unlock search, filters, and transaction history.</span>
        </div>
      ) : visibleTransactions.length === 0 ? (
        <div className="empty-state empty-state--compact">
          <p>No transactions match the current filters.</p>
          <span>Try a broader search or reset the filters to view all activity.</span>
          <button
            type="button"
            className="ghost-button ghost-button--spaced"
            onClick={resetFilters}
          >
            Reset view
          </button>
        </div>
      ) : (
        <>
          <div className="transaction-table-wrap">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th scope="col">Description</th>
                  <th scope="col">Date</th>
                  <th scope="col">Category</th>
                  <th scope="col">Type</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="transaction-description">
                        <strong>{transaction.description}</strong>
                        <span>ID {transaction.id}</span>
                      </div>
                    </td>
                    <td>{formatTransactionDateLabel(transaction.date)}</td>
                    <td>
                      <span className="category-pill">{transaction.category}</span>
                    </td>
                    <td>
                      <span
                        className={`type-badge type-badge--${transaction.type}`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`amount-text amount-text--${transaction.type}`}
                      >
                        {formatSignedTransactionAmount(transaction)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="transaction-cards">
            {visibleTransactions.map((transaction) => (
              <article key={transaction.id} className="transaction-card">
                <div className="transaction-card__topline">
                  <div className="transaction-description">
                    <strong>{transaction.description}</strong>
                    <span>{formatTransactionDateLabel(transaction.date)}</span>
                  </div>
                  <span
                    className={`amount-text amount-text--${transaction.type}`}
                  >
                    {formatSignedTransactionAmount(transaction)}
                  </span>
                </div>

                <div className="transaction-card__meta">
                  <span className="category-pill">{transaction.category}</span>
                  <span className={`type-badge type-badge--${transaction.type}`}>
                    {transaction.type}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
