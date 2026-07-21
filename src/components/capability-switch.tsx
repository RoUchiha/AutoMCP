type CapabilitySwitchProps = { enabled: boolean; onChange: (enabled: boolean) => void };

export function CapabilitySwitch({ enabled, onChange }: CapabilitySwitchProps) {
  return (
    <div className="switch-row">
      <button type="button" role="switch" aria-checked={enabled} aria-label="Advanced capabilities" className={`switch ${enabled ? "on" : ""}`} onClick={() => onChange(!enabled)}>
        <span />
      </button>
      <span><strong>Advanced capabilities</strong><small>Unlock webhooks, scheduled jobs, workflows, and stricter execution controls.</small></span>
    </div>
  );
}
