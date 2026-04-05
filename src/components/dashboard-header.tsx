import type { Role, ThemeMode } from '../types/finance';

type DashboardHeaderProps = {
  currentRole: Role;
  currentTheme: ThemeMode;
  onRoleChange: (role: Role) => void;
  onThemeToggle: () => void;
  timeWindowLabel: string;
};

export function DashboardHeader({
  currentRole,
  currentTheme,
  onRoleChange,
  onThemeToggle,
  timeWindowLabel,
}: DashboardHeaderProps) {
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

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
        <label className="role-switcher">
          <span className="dashboard-header__window-label">Role</span>
          <select
            className="role-switcher__select"
            value={currentRole}
            onChange={(event) => onRoleChange(event.target.value as Role)}
            aria-label="Select dashboard role"
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button
          type="button"
          className="theme-toggle"
          onClick={onThemeToggle}
          aria-label={`Switch to ${nextTheme} mode`}
          title={`Switch to ${nextTheme} mode`}
        >
          <span className="theme-toggle__indicator" aria-hidden="true">
            <span className="theme-toggle__thumb" />
          </span>
          <span className="theme-toggle__copy">
            {currentTheme === 'light' ? 'Light mode' : 'Dark mode'}
          </span>
        </button>
      </div>
    </header>
  );
}
