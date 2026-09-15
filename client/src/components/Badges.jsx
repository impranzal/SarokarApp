const STANCE_STYLES = {
  support: 'text-sarokar-green border-sarokar-green/40 bg-sarokar-green/5',
  oppose: 'text-sarokar-terracotta border-sarokar-terracotta/40 bg-sarokar-terracotta/5',
  neutral: 'text-ink/60 border-ink/20 bg-ink/5',
};

export function StanceBadge({ stance }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded border ${STANCE_STYLES[stance] || STANCE_STYLES.neutral}`}>
      {stance}
    </span>
  );
}

const STATUS_STYLES = {
  draft: 'text-ink/50 border-ink/20',
  open: 'text-sarokar-green border-sarokar-green/40',
  closed: 'text-govblue border-govblue/40',
  archived: 'text-ink/40 border-ink/15',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[status] || ''}`}>
      {status}
    </span>
  );
}

export function CategoryChip({ category }) {
  return (
    <span className="inline-block text-xs px-2 py-0.5 rounded bg-govblue-dark/5 text-govblue-dark border border-govblue-dark/10">
      {category.replace(/-/g, ' ')}
    </span>
  );
}
