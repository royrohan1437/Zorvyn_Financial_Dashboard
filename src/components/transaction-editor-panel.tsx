import { useState, type FormEvent } from 'react';
import { transactionCategories, type TransactionCategory } from '../types/finance';
import {
  createEmptyTransactionDraft,
  type TransactionDraft,
  type TransactionEditorMode,
  validateTransactionDraft,
} from '../utils/transactions';

type TransactionEditorPanelProps = {
  initialDraft?: TransactionDraft;
  mode: TransactionEditorMode;
  onCancel: () => void;
  onSubmit: (draft: TransactionDraft) => void;
};

export function TransactionEditorPanel({
  initialDraft,
  mode,
  onCancel,
  onSubmit,
}: TransactionEditorPanelProps) {
  const [draft, setDraft] = useState<TransactionDraft>(
    () => initialDraft ?? createEmptyTransactionDraft(),
  );
  const [formError, setFormError] = useState<string | null>(null);

  function updateDraft<K extends keyof TransactionDraft>(
    field: K,
    value: TransactionDraft[K],
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));

    if (formError) {
      setFormError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateTransactionDraft(draft);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    onSubmit(draft);
  }

  return (
    <section className="editor-panel" aria-labelledby="transaction-editor-title">
      <div className="editor-panel__header">
        <div>
          <p className="eyebrow">Admin tools</p>
          <h3 id="transaction-editor-title">
            {mode === 'create' ? 'Add a transaction' : 'Edit transaction'}
          </h3>
          <p className="editor-panel__copy">
            Changes update the frontend state only, which makes this perfect for
            demonstrating admin permissions without a backend.
          </p>
        </div>

        <button type="button" className="ghost-button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <form className="editor-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Description</span>
          <input
            className="field__control"
            type="text"
            value={draft.description}
            onChange={(event) => updateDraft('description', event.target.value)}
            placeholder="e.g. Client invoice payment"
          />
        </label>

        <label className="field">
          <span className="field__label">Date</span>
          <input
            className="field__control"
            type="date"
            value={draft.date}
            onChange={(event) => updateDraft('date', event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Amount</span>
          <input
            className="field__control"
            type="number"
            min="0"
            step="0.01"
            value={draft.amount}
            onChange={(event) => updateDraft('amount', event.target.value)}
            placeholder="0.00"
          />
        </label>

        <label className="field">
          <span className="field__label">Type</span>
          <select
            className="field__control"
            value={draft.type}
            onChange={(event) =>
              updateDraft('type', event.target.value as TransactionDraft['type'])
            }
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Category</span>
          <select
            className="field__control"
            value={draft.category}
            onChange={(event) =>
              updateDraft(
                'category',
                event.target.value as TransactionCategory,
              )
            }
          >
            {transactionCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        {formError ? (
          <p className="form-error" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="editor-form__actions">
          <button type="button" className="ghost-button" onClick={onCancel}>
            Dismiss
          </button>
          <button type="submit" className="primary-button">
            {mode === 'create' ? 'Create transaction' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
