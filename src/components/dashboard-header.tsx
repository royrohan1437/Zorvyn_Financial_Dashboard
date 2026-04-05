type DashboardHeaderProps = {
  timeWindowLabel: string;
};

export function DashboardHeader({ timeWindowLabel }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">Zorvyn Capital</p>
        <p className="dashboard-header__title">Finance Dashboard</p>
      </div>

      <div className="dashboard-header__meta">
        <div className="dashboard-header__window">
          <span className="dashboard-header__window-label">Tracking</span>
          <strong>{timeWindowLabel}</strong>
        </div>
        <div className="dashboard-header__status">
          <span className="status-dot" />
          <span>Mock portfolio live</span>
        </div>
      </div>
    </header>
  );
}
