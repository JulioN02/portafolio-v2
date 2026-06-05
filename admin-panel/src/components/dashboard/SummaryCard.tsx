import listStyles from '../shared/ListItem.module.css';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
}

export function SummaryCard({ title, value, icon, color = '#4ade80' }: SummaryCardProps) {
  return (
    <div className={listStyles.summaryCard}>
      <div
        className={listStyles.summaryIcon}
        style={{ background: `${color}20` }}
      >
        {icon}
      </div>
      <div>
        <p className={listStyles.summaryTitle}>{title}</p>
        <p className={listStyles.summaryValue}>
          {value}
        </p>
      </div>
    </div>
  );
}