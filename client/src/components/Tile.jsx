import './Tile.css';

export function Tile({ icon, label, color = 'green', onClick }) {
  const IconComponent = icon;
  const colorClass = `tile--${color}`;

  return (
    <button onClick={onClick} className={`tile ${colorClass}`}>
      <IconComponent className="tile-icon" strokeWidth={2} />
      <span className="tile-label">{label}</span>
    </button>
  );
}
