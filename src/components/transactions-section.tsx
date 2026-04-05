import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { ActionToast } from './action-toast';
import { TransactionEditorPanel } from './transaction-editor-panel';
import { useDashboard } from '../state/dashboard-context';
import type { Transaction } from '../types/finance';
import { currencyFormatter } from '../utils/finance';
import {
  applyTransactionFilters,
  buildTransactionFromDraft,
  createEmptyTransactionDraft,
  createDraftFromTransaction,
  formatSignedTransactionAmount,
  formatTransactionDateLabel,
  generateTransactionId,
  getTransactionCategories,
  summarizeTransactionActivity,
  transactionSortOptions,
  type TransactionDraft,
  type TransactionEditorMode,
  type TransactionCategoryFilter,
  type TransactionFilterType,
  type TransactionSortOption,
} from '../utils/transactions';

type TransactionsSectionProps = {
  onCategoryChange: (category: TransactionCategoryFilter) => void;
  onResetFilters: () => void;
  onTypeChange: (type: TransactionFilterType) => void;
  selectedCategory: TransactionCategoryFilter;
  selectedType: TransactionFilterType;
  transactions: Transaction[];
};

type TransactionToast = {
  id: number;
  eyebrow: string;
  title: string;
  message: string;
};

export function TransactionsSection({
  onCategoryChange,
  onResetFilters,
  onTypeChange,
  selectedCategory,
  selectedType,
  transactions,
}: TransactionsSectionProps) {
  const { dispatch, selectedRole } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] =
    useState<TransactionSortOption>('latest');
  const [editorMode, setEditorMode] =
    useState<TransactionEditorMode>('create');
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(
    null,
  );
  const [editorDraft, setEditorDraft] = useState<TransactionDraft | null>(null);
  const [toast, setToast] = useState<TransactionToast | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const isAdmin = selectedRole === 'admin';
  const isEditorOpen = editorDraft !== null;

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

  useEffect(() => {
    if (!isAdmin && isEditorOpen) {
      setEditorDraft(null);
      setEditingTransactionId(null);
    }
  }, [isAdmin, isEditorOpen]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast((currentToast) =>
        currentToast?.id === toast.id ? null : currentToast,
      );
    }, 3800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  function resetFilters() {
    setSearchTerm('');
    setSortOption('latest');
    onResetFilters();
  }

  function openCreateEditor() {
    setEditorMode('create');
    setEditingTransactionId(null);
    setEditorDraft(createEmptyTransactionDraft());
  }

  function openEditEditor(transaction: Transaction) {
    setEditorMode('edit');
    setEditingTransactionId(transaction.id);
    setEditorDraft(createDraftFromTransaction(transaction));
  }

  function closeEditor() {
    setEditingTransactionId(null);
    setEditorDraft(null);
  }

  function dismissToast() {
    setToast(null);
  }

  function showTransactionToast(
    mode: TransactionEditorMode,
    transaction: Transaction,
  ) {
    const amountLabel = currencyFormatter.format(transaction.amount);
    const toastCopy =
      mode === 'create'
        ? {
            eyebrow: 'Admin activity',
            title: 'Transaction created',
            message: `${transaction.description} was added as ${transaction.type} for ${amountLabel}.`,
          }
        : {
            eyebrow: 'Admin activity',
            title: 'Changes saved',
            message: `${transaction.description} is now saved under ${transaction.category} for ${amountLabel}.`,
          };

    setToast({
      id: Date.now(),
      ...toastCopy,
    });
  }

  function handleEditorSubmit(draft: TransactionDraft) {
    const nextTransaction = buildTransactionFromDraft(
      draft,
      editingTransactionId ?? generateTransactionId(),
    );

    const nextTransactions =
      editorMode === 'create'
        ? [nextTransaction, ...transactions]
        : transactions.map((transaction) =>
            transaction.id === editingTransactionId ? nextTransaction : transaction,
          );

    startTransition(() => {
      dispatch({
        type: 'set-transactions',
        payload: nextTransactions,
      });
    });

    closeEditor();
    showTransactionToast(editorMode, nextTransaction);
  }

  function handleRestoreDemoData() {
    if (!window.confirm('Restore the original demo transactions?')) {
      return;
    }

    startTransition(() => {
      dispatch({
        type: 'reset-transactions',
      });
    });

    closeEditor();
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
              onTypeChange(event.target.value as TransactionFilterType)
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
              onCategoryChange(event.target.value as TransactionCategoryFilter)
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

        <div className="transactions-meta__actions">
          <div className={`access-note access-note--${selectedRole}`}>
            <strong>{isAdmin ? 'Admin access enabled' : 'Viewer access'}</strong>
            <span>
              {isAdmin
                ? 'Add and edit actions are available in this mode.'
                : 'This mode is read-only. Switch to admin to make changes.'}
            </span>
          </div>

          <span className="persistence-note">
            Transaction changes save locally in this browser.
          </span>

          {hasActiveFilters ? (
            <button
              type="button"
              className="ghost-button"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          ) : null}

          <button
            type="button"
            className="primary-button"
            onClick={openCreateEditor}
            disabled={!isAdmin}
            title={
              isAdmin
                ? 'Add a new transaction'
                : 'Switch to admin mode to add transactions'
            }
          >
            {isAdmin ? 'Add transaction' : 'Admin can add transactions'}
          </button>

          {isAdmin ? (
            <button
              type="button"
              className="ghost-button"
              onClick={handleRestoreDemoData}
            >
              Restore demo data
            </button>
          ) : null}
        </div>
      </div>

      {isAdmin && isEditorOpen && editorDraft ? (
        <TransactionEditorPanel
          key={`${editorMode}-${editingTransactionId ?? 'new'}`}
          initialDraft={editorDraft}
          mode={editorMode}
          onCancel={closeEditor}
          onSubmit={handleEditorSubmit}
        />
      ) : null}

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
                  {isAdmin ? <th scope="col">Actions</th> : null}
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
                    {isAdmin ? (
                      <td>
                        <button
                          type="button"
                          className="table-action"
                          onClick={() => openEditEditor(transaction)}
                        >
                          Edit
                        </button>
                      </td>
                    ) : null}
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

                {isAdmin ? (
                  <div className="transaction-card__actions">
                    <button
                      type="button"
                      className="table-action"
                      onClick={() => openEditEditor(transaction)}
                    >
                      Edit transaction
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}

      {toast ? (
        <ActionToast
          eyebrow={toast.eyebrow}
          title={toast.title}
          message={toast.message}
          onDismiss={dismissToast}
        />
      ) : null}
    </section>
  );
}
