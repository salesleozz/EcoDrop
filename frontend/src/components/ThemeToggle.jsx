import { useTheme } from '../theme.jsx';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle btn btn-sm shadow"
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      aria-label="Alternar tema"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}