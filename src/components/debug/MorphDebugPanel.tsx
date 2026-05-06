/**
 * MorphDebugPanel.tsx
 * 
 * A debug UI panel that displays all available morph targets (blend shapes) as sliders.
 * Allows real-time adjustment of each morph target's influence value (0-1) to test
 * the model's facial animations.
 */

interface Props {
  blendshapes: Record<string, number>  // Current morph target values
  onChange: (key: string, value: number) => void  // Callback when slider changes
}

export function MorphDebugPanel({ blendshapes, onChange }: Props) {
  return (
    /**
     * Fixed panel positioned in top-right corner of the screen
     * Shows all morph targets with range sliders for testing
     */
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
      {/* Render a slider for each morph target */}
      {Object.entries(blendshapes).map(([key, value]) => (
        <div key={key} style={{ marginTop: '8px' }}>
          {/* Show morph target name and current value (0.00-1.00) */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{key}</span>
            <span>{value.toFixed(2)}</span>
            {/* toFixed() => Display value with 2 decimal places for readability, increase value range for finer control */}
          </div>
          {/* Range slider to adjust morph target influence value */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01} /* Allow finer control over morph target values. Increase / decrease to change how sensitive the slider is */
            value={value}
            onChange={(e) => onChange(key, parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      ))}
    </div>
  )
}