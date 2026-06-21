'use client';

import { useState } from 'react';
import { SUBMITTABLE_CATEGORIES, PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { submitPlace, geocodeAddress } from '@/services/supabaseService';
import type { PlaceCategory } from '@/types/place';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DayKey = 'Lu' | 'Ma' | 'Me' | 'Je' | 'Ve' | 'Sa' | 'Di';
const DAYS: DayKey[] = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

const HOURS = Array.from({ length: 25 }, (_, i) => i.toString().padStart(2, '0') + 'h');
const MINUTES = ['00', '15', '30', '45'];

type TimeValue = { hour: string; minute: string };

interface DaySchedule {
  open: boolean;
  from: TimeValue;
  to: TimeValue;
  hasOverride: boolean;
}

type Schedule = Record<DayKey, DaySchedule>;

const DEFAULT_FROM: TimeValue = { hour: '08h', minute: '00' };
const DEFAULT_TO: TimeValue   = { hour: '20h', minute: '00' };

const defaultSchedule = (): Schedule =>
  Object.fromEntries(
    DAYS.map((d) => [d, { open: false, from: { ...DEFAULT_FROM }, to: { ...DEFAULT_TO }, hasOverride: false }])
  ) as Schedule;

function formatSchedule(schedule: Schedule): string {
  type Slot = { days: DayKey[]; from: string; to: string };
  const slots: Slot[] = [];
  for (const day of DAYS) {
    const s = schedule[day];
    if (!s.open) continue;
    const from = `${s.from.hour}${s.from.minute !== '00' ? s.from.minute : ''}`;
    const to   = `${s.to.hour}${s.to.minute !== '00' ? s.to.minute : ''}`;
    const existing = slots.find((sl) => sl.from === from && sl.to === to);
    if (existing) existing.days.push(day);
    else slots.push({ days: [day], from, to });
  }
  return slots
    .map(({ days, from, to }) => {
      const parts: string[] = [];
      let start: DayKey | null = null;
      let prev: DayKey | null = null;
      const flush = () => {
        if (!start) return;
        parts.push(start === prev ? start : `${start}-${prev}`);
        start = null; prev = null;
      };
      for (const day of DAYS) {
        if (days.includes(day)) { if (!start) start = day; prev = day; }
        else flush();
      }
      flush();
      return `${parts.join(', ')} ${from}-${to}`;
    })
    .join(' ; ');
}

// ---------------------------------------------------------------------------
// TimeSelect — version web avec <select>
// ---------------------------------------------------------------------------

function TimeSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)', padding: 'var(--space-1) var(--space-2)',
        fontSize: 'var(--text-xs)', color: 'var(--color-text)', cursor: 'pointer', fontFamily: 'monospace',
      }}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function TimeRow({ from, to, label, onChangeFrom, onChangeTo }: {
  from: TimeValue; to: TimeValue; label: string;
  onChangeFrom: (tv: TimeValue) => void; onChangeTo: (tv: TimeValue) => void;
}) {
  return (
    <div style={{ marginTop: 10, backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', border: '1px solid var(--color-border)' }}>
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', fontFamily: 'monospace' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <TimeSelect value={from.hour}   options={HOURS}   onChange={(v) => onChangeFrom({ ...from, hour: v })} />
        <span style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>:</span>
        <TimeSelect value={from.minute} options={MINUTES} onChange={(v) => onChangeFrom({ ...from, minute: v })} />
        <span style={{ color: 'var(--color-text-faint)', fontFamily: 'monospace', margin: '0 4px' }}>→</span>
        <TimeSelect value={to.hour}   options={HOURS}   onChange={(v) => onChangeTo({ ...to, hour: v })} />
        <span style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>:</span>
        <TimeSelect value={to.minute} options={MINUTES} onChange={(v) => onChangeTo({ ...to, minute: v })} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HoursEditor
// ---------------------------------------------------------------------------

function HoursEditor({ schedule, onChange }: { schedule: Schedule; onChange: (s: Schedule) => void }) {
  const [expandedDay, setExpandedDay] = useState<DayKey | null>(null);
  const [sharedFrom, setSharedFrom] = useState<TimeValue>({ ...DEFAULT_FROM });
  const [sharedTo, setSharedTo]     = useState<TimeValue>({ ...DEFAULT_TO });

  const applyShared = (from: TimeValue, to: TimeValue) => {
    const next = { ...schedule };
    for (const day of DAYS) {
      if (next[day].open && !next[day].hasOverride)
        next[day] = { ...next[day], from: { ...from }, to: { ...to } };
    }
    onChange(next);
  };

  const handleToggleDay = (day: DayKey) => {
    const wasOpen = schedule[day].open;
    if (!wasOpen) {
      onChange({ ...schedule, [day]: { ...schedule[day], open: true, from: { ...sharedFrom }, to: { ...sharedTo }, hasOverride: false } });
    } else {
      if (expandedDay === day) setExpandedDay(null);
      onChange({ ...schedule, [day]: { ...schedule[day], open: false, hasOverride: false } });
    }
  };

  const handlePressOpenDay = (day: DayKey) => {
    if (!schedule[day].open) return;
    if (expandedDay === day) { setExpandedDay(null); }
    else { onChange({ ...schedule, [day]: { ...schedule[day], hasOverride: true } }); setExpandedDay(day); }
  };

  const anyOpen = DAYS.some((d) => schedule[d].open);

  return (
    <div style={{ marginBottom: 4 }}>
      <TimeRow
        from={sharedFrom} to={sharedTo} label="Horaire commune"
        onChangeFrom={(v) => { setSharedFrom(v); applyShared(v, sharedTo); }}
        onChangeTo={(v)   => { setSharedTo(v);   applyShared(sharedFrom, v); }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 10 }}>
        {DAYS.map((day) => {
          const isOpen = schedule[day].open;
          const hasOverride = schedule[day].hasOverride;
          return (
            <button
              key={day}
              onClick={() => isOpen ? handlePressOpenDay(day) : handleToggleDay(day)}
              style={{
                width: 38, height: 38, borderRadius: 'var(--radius-md)',
                border: `1px solid ${hasOverride ? '#e8a838' : isOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: isOpen ? 'var(--color-primary-highlight)' : 'transparent',
                color: isOpen ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: isOpen ? 700 : 400, fontSize: 'var(--text-xs)',
                cursor: 'pointer', position: 'relative', fontFamily: 'monospace',
              }}
            >
              {day}
              {hasOverride && (
                <span style={{ position: 'absolute', bottom: 3, right: 3, width: 5, height: 5, borderRadius: '50%', backgroundColor: '#e8a838', display: 'block' }} />
              )}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 10, color: 'var(--color-text-faint)', marginTop: 6, fontFamily: 'monospace', lineHeight: 1.5 }}>
        Cliquer pour activer/désactiver · Recliquer un jour actif pour horaire spéciale
      </p>
      {expandedDay && schedule[expandedDay].open && (
        <TimeRow
          from={schedule[expandedDay].from} to={schedule[expandedDay].to}
          label={`${expandedDay} — horaire spéciale`}
          onChangeFrom={(v) => onChange({ ...schedule, [expandedDay]: { ...schedule[expandedDay], from: v, hasOverride: true } })}
          onChangeTo={(v)   => onChange({ ...schedule, [expandedDay]: { ...schedule[expandedDay], to: v, hasOverride: true } })}
        />
      )}
      {anyOpen && (
        <p style={{ marginTop: 10, fontSize: 11, color: 'var(--color-primary)', fontFamily: 'monospace', lineHeight: 1.5 }}>
          {formatSchedule(schedule)}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal principal
// ---------------------------------------------------------------------------

type Props = { open: boolean; onClose: () => void };

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.08em',
  textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600,
  marginBottom: 'var(--space-2)', marginTop: 'var(--space-5)', display: 'block',
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
  color: 'var(--color-text)', fontFamily: 'monospace', fontSize: 'var(--text-sm)',
  outline: 'none', boxSizing: 'border-box',
};

export function SubmitPlaceModal({ open, onClose }: Props) {
  const [name, setName]         = useState('');
  const [category, setCategory] = useState<PlaceCategory>('grocery');
  const [address, setAddress]   = useState('');
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule());
  const [note, setNote]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [result, setResult]     = useState<{ ok: boolean; message: string } | null>(null);

  const reset = () => {
    setName(''); setCategory('grocery'); setAddress('');
    setSchedule(defaultSchedule()); setNote(''); setResult(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!name.trim()) { setResult({ ok: false, message: 'Le nom est requis.' }); return; }
    if (!address.trim()) { setResult({ ok: false, message: "L'adresse postale est requise." }); return; }
    setGeocoding(true);
    const coords = await geocodeAddress(address.trim());
    setGeocoding(false);
    if (!coords) {
      setResult({ ok: false, message: 'Adresse introuvable. Vérifiez et réessayez (ex : 12 rue de Rivoli, Paris).' });
      return;
    }
    setLoading(true);
    const hoursStr = formatSchedule(schedule);
    const res = await submitPlace({
      name: name.trim(), category,
      latitude: coords.latitude, longitude: coords.longitude,
      short_address: address.trim(),
      opening_hours: hoursStr || undefined,
      description: note.trim() || undefined,
    });
    setLoading(false);
    setResult(
      res.ok
        ? { ok: true, message: '✓ Soumis\u00a0! Visible après validation admin.' }
        : { ok: false, message: res.error ?? 'Erreur inconnue.' }
    );
  };

  const busy = loading || geocoding;

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'oklch(0 0 0 / 0.7)', zIndex: 200 }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Proposer un commerce"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          borderTop: '1px solid var(--color-border)',
          maxHeight: '92dvh', display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 250ms cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {/* Header fixe */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text)', margin: 0 }}>Ajouter un lieu</h2>
          <button onClick={handleClose} aria-label="Fermer" style={{ fontSize: 20, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-2)' }}>✕</button>
        </div>

        {/* Contenu scrollable */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-2) var(--space-5) calc(var(--space-10) + env(safe-area-inset-bottom))' }}>

          <label style={LABEL_STYLE}>Nom *</label>
          <input
            style={INPUT_STYLE} value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Épicerie Mohamed" maxLength={80}
          />

          <label style={LABEL_STYLE}>Type</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {SUBMITTABLE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  border: `1px solid ${category === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-full)', padding: 'var(--space-1) var(--space-4)',
                  backgroundColor: category === cat ? 'var(--color-primary-highlight)' : 'transparent',
                  color: category === cat ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontWeight: category === cat ? 600 : 400,
                  fontSize: 'var(--text-xs)', cursor: 'pointer', fontFamily: 'monospace',
                }}
              >
                {PLACE_TYPE_LABELS[cat]}
              </button>
            ))}
          </div>

          <label style={LABEL_STYLE}>Adresse postale *</label>
          <input
            style={INPUT_STYLE} value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex : 12 rue de la Paix, 75001 Paris" maxLength={150}
          />
          <p style={{ fontSize: 11, color: 'var(--color-text-faint)', marginTop: 'var(--space-2)', fontFamily: 'monospace', lineHeight: 1.5 }}>
            Coordonnées GPS calculées via OpenStreetMap.
          </p>

          <label style={LABEL_STYLE}>Horaires (optionnel)</label>
          <HoursEditor schedule={schedule} onChange={setSchedule} />

          <label style={LABEL_STYLE}>Note (optionnel)</label>
          <textarea
            style={{ ...INPUT_STYLE, minHeight: 72, resize: 'vertical' }}
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Stand de rue, épicerie de nuit…" maxLength={200}
          />

          {result && (
            <div style={{
              padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-4)',
              border: `1px solid ${result.ok ? 'var(--color-primary)' : 'var(--color-error)'}`,
              backgroundColor: 'var(--color-bg)',
            }}>
              <p style={{ fontSize: 'var(--text-sm)', color: result.ok ? 'var(--color-primary)' : 'var(--color-error)', margin: 0, fontFamily: 'monospace' }}>
                {result.message}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={busy}
            style={{
              width: '100%', marginTop: 'var(--space-6)', padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)', border: 'none',
              backgroundColor: 'var(--color-primary)', color: '#fff',
              fontWeight: 700, fontSize: 'var(--text-sm)', fontFamily: 'monospace',
              cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.5 : 1,
            }}
          >
            {busy ? (geocoding ? 'Géocodage…' : 'Envoi…') : 'Envoyer pour validation'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  );
}
