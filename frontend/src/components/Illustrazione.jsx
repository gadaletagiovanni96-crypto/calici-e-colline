const prugna = '#653e51';
const crema = '#fff5e1';
const bottiglia = '#854344';
const tappo = '#243528';
const etichetta = '#6a3d55';
const calice = '#c6a15c';

export function Tenda() {
  const n = 7;
  const larghezza = 100 / n;

  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="block h-24 w-full sm:h-32" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const x = i * larghezza;
        const colore = i % 2 === 0 ? prugna : crema;
        return (
          <g key={i}>
            <rect x={x} y="0" width={larghezza + 0.15} height="18" fill={colore} />
            <circle cx={x + larghezza / 2} cy="18" r={larghezza / 2} fill={colore} />
          </g>
        );
      })}
    </svg>
  );
}

export function NaturaMorta({ className = '' }) {
  return (
    <svg viewBox="0 0 280 320" className={className} role="img" aria-label="Bottiglia e calice">
      <path
        fill={calice}
        d="M46 112 L58 176 C66 206 78 216 92 218 C106 216 118 206 126 176 L138 112 Z"
      />
      <path fill="#a8843e" d="M46 112 H138 L134 122 H50 Z" />
      <rect x="90" y="216" width="4" height="58" fill={tappo} />
      <ellipse cx="92" cy="276" rx="26" ry="7" fill={tappo} />

      <rect x="176" y="28" width="24" height="42" fill={tappo} />
      <path fill={bottiglia} d="M170 70h36c10 22 26 40 26 78v132h-88V148c0-38 16-56 26-78z" />
      <rect x="184" y="156" width="30" height="54" fill={etichetta} />
    </svg>
  );
}
