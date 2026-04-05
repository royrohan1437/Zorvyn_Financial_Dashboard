import type { Transaction } from '../types/finance';

export type TransactionExportRange =
  | '24h'
  | '3d'
  | '7d'
  | '15d'
  | '1m'
  | '3m'
  | '6m'
  | '1y';

export type TransactionExportFormat = 'csv' | 'json';

const dayMs = 24 * 60 * 60 * 1000;

const exportAnchorFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export const transactionExportRangeOptions: Array<{
  label: string;
  value: TransactionExportRange;
}> = [
  { label: '24 hrs', value: '24h' },
  { label: '3 days', value: '3d' },
  { label: '7 days', value: '7d' },
  { label: '15 days', value: '15d' },
  { label: '1 month', value: '1m' },
  { label: '3 month', value: '3m' },
  { label: '6 month', value: '6m' },
  { label: '1 year', value: '1y' },
];

function parseTransactionDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function getLatestTransactionDate(transactions: Transaction[]) {
  if (transactions.length === 0) {
    return null;
  }

  return transactions.reduce<Date>((latestDate, transaction) => {
    const nextDate = parseTransactionDate(transaction.date);
    return nextDate > latestDate ? nextDate : latestDate;
  }, parseTransactionDate(transactions[0].date));
}

function getAnchorEndOfDay(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

function getRangeCutoff(anchorDate: Date, range: TransactionExportRange) {
  const anchorEndOfDay = getAnchorEndOfDay(anchorDate);

  switch (range) {
    case '24h':
      return new Date(anchorEndOfDay.getTime() - dayMs + 1);
    case '3d':
      return new Date(anchorEndOfDay.getTime() - dayMs * 3 + 1);
    case '7d':
      return new Date(anchorEndOfDay.getTime() - dayMs * 7 + 1);
    case '15d':
      return new Date(anchorEndOfDay.getTime() - dayMs * 15 + 1);
    case '1m': {
      const cutoff = new Date(anchorEndOfDay);
      cutoff.setUTCMonth(cutoff.getUTCMonth() - 1);
      cutoff.setUTCMilliseconds(cutoff.getUTCMilliseconds() + 1);
      return cutoff;
    }
    case '3m': {
      const cutoff = new Date(anchorEndOfDay);
      cutoff.setUTCMonth(cutoff.getUTCMonth() - 3);
      cutoff.setUTCMilliseconds(cutoff.getUTCMilliseconds() + 1);
      return cutoff;
    }
    case '6m': {
      const cutoff = new Date(anchorEndOfDay);
      cutoff.setUTCMonth(cutoff.getUTCMonth() - 6);
      cutoff.setUTCMilliseconds(cutoff.getUTCMilliseconds() + 1);
      return cutoff;
    }
    case '1y':
    default: {
      const cutoff = new Date(anchorEndOfDay);
      cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
      cutoff.setUTCMilliseconds(cutoff.getUTCMilliseconds() + 1);
      return cutoff;
    }
  }
}

function escapeCsvValue(value: string | number) {
  const normalizedValue = String(value);

  if (/[",\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replace(/"/g, '""')}"`;
  }

  return normalizedValue;
}

export function getTransactionExportRangeLabel(range: TransactionExportRange) {
  return (
    transactionExportRangeOptions.find((option) => option.value === range)?.label ??
    range
  );
}

export function getTransactionExportAnchorLabel(transactions: Transaction[]) {
  const anchorDate = getLatestTransactionDate(transactions);

  return anchorDate ? exportAnchorFormatter.format(anchorDate) : 'No export anchor';
}

export function filterTransactionsByExportRange(
  transactions: Transaction[],
  range: TransactionExportRange,
) {
  const anchorDate = getLatestTransactionDate(transactions);

  if (!anchorDate) {
    return [];
  }

  const cutoff = getRangeCutoff(anchorDate, range);

  return transactions.filter((transaction) => parseTransactionDate(transaction.date) >= cutoff);
}

export function buildTransactionExportFilename(
  transactions: Transaction[],
  range: TransactionExportRange,
  format: TransactionExportFormat,
) {
  const anchorDate = getLatestTransactionDate(transactions);
  const anchorValue = anchorDate
    ? anchorDate.toISOString().slice(0, 10)
    : 'no-data';

  return `transactions-${range}-${anchorValue}.${format}`;
}

export function buildTransactionsCsv(transactions: Transaction[]) {
  const headers = ['ID', 'Date', 'Description', 'Category', 'Type', 'Amount'];
  const rows = transactions.map((transaction) => [
    transaction.id,
    transaction.date,
    transaction.description,
    transaction.category,
    transaction.type,
    transaction.amount.toFixed(2),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
    .join('\n');
}

export function buildTransactionsJson(
  transactions: Transaction[],
  range: TransactionExportRange,
) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      timeSpan: {
        value: range,
        label: getTransactionExportRangeLabel(range),
      },
      anchorDate: getLatestTransactionDate(transactions)?.toISOString().slice(0, 10) ?? null,
      recordCount: transactions.length,
      transactions,
    },
    null,
    2,
  );
}

export function downloadExportFile(
  filename: string,
  content: string,
  mimeType: string,
) {
  const file = new Blob([content], { type: mimeType });
  const objectUrl = window.URL.createObjectURL(file);
  const downloadLink = document.createElement('a');

  downloadLink.href = objectUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 0);
}
