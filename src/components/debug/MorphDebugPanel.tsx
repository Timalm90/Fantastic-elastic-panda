// src/components/debug/MorphDebugPanel.tsx

interface Props {
  blendshapes: Record<string, number>
  onChange: (key: string, value: number) => void
}

export function MorphDebugPanel({ blendshapes, onChange }: Props) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '260px',
      height: '100vh',
      overflowY: 'auto',
      background: 'rgba(0,0,0,0.75)',
      color: 'white',
      padding: '12px',
      fontFamily: 'monospace',
      fontSize: '11px',
      zIndex: 100,
    }}>
      <strong>Morph Targets</strong>
      {Object.entries(blendshapes).map(([key, value]) => (
        <div key={key} style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{key}</span>
            <span>{value.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            step={0.01}
            value={value}
            onChange={(e) => onChange(key, parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      ))}
    </div>
  )
}