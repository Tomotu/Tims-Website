// Tweaks panel — live design controls (accent colour, theme, film grain)
// Loaded as text/babel so JSX works in-browser.

function useTweaks(defaults) {
  const [state, setState] = React.useState({ ...defaults });
  const setTweak = (key, val) => setState(s => ({ ...s, [key]: val }));
  return [state, setTweak];
}

function TweaksPanel({ children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ fontFamily: 'var(--sans, system-ui)', position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Design tweaks"
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--bg-2, #1a1a18)',
          border: '1px solid var(--border, #272724)',
          color: 'var(--muted, #6a6a62)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >⚙</button>
      {open && (
        <div style={{
          position: 'absolute', bottom: 44, right: 0,
          background: 'var(--bg-2, #1a1a18)',
          border: '1px solid var(--border, #272724)',
          borderRadius: 6, padding: '16px 18px',
          minWidth: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
            Design
          </div>
          {children}
        </div>
      )}
    </div>
  );
}

function TweakSection({ label }) {
  return (
    <div style={{ fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10, marginTop: 4 }}>
      {label}
    </div>
  );
}

function TweakColor({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            title={opt}
            style={{
              width: 22, height: 22, borderRadius: '50%',
              background: opt,
              border: value === opt ? '2px solid var(--text)' : '2px solid transparent',
              outline: value === opt ? '1px solid var(--border)' : 'none',
              cursor: 'pointer', padding: 0,
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '4px 12px',
              fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'capitalize',
              border: '1px solid var(--border)',
              borderRadius: 3,
              background: value === opt ? 'var(--accent)' : 'transparent',
              color: value === opt ? '#fff' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >{opt}</button>
        ))}
      </div>
    </div>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 10,
          background: value ? 'var(--accent)' : 'var(--border)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 18 : 3,
          width: 14, height: 14, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}
