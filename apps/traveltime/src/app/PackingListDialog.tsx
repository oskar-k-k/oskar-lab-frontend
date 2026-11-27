"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { TranslationKey } from "@oskar-lab/i18n/messages";
import { usePackingList } from "../hooks/usePackingList";
import { checkPackingItem, packingProgress, validPackingList, type PackingList, type PackingPerson } from "../model/packing";
import styles from "./PackingList.module.css";

/** Full-screen, focus-trapped checklist; drafts stay local until an explicit owner save. */
export default function PackingListDialog({ tripId, canEdit, onClose, navigation }: { tripId: string; canEdit: boolean; onClose: () => void; navigation?: (leave: (action: () => void) => void, saving: boolean) => ReactNode }) {
  const { t, locale } = useI18n();
  const label = (key: string) => t(("travel." + key) as TranslationKey);
  const state = usePackingList(tripId);
  const [draft, setDraft] = useState<PackingList | null>(null);
  const [selected, setSelected] = useState("");
  const [invalid, setInvalid] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const editing = draft !== null;
  const value = state.error === "denied" ? null : draft ?? state.list;
  const person = value?.people.find(p => p.id === selected) ?? value?.people[0];
  const disabled = state.saving || state.loading || state.offline || state.blocked;
  const count = (items: Parameters<typeof packingProgress>[0]) => {
    const progress = packingProgress(items);
    return `${new Intl.NumberFormat(locale).format(progress.checked)}/${new Intl.NumberFormat(locale).format(progress.total)}`;
  };
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = overflow; if (trigger?.isConnected) trigger.focus({ preventScroll: true }); };
  }, []);
  const leave = (action: () => void) => {
    if (state.saving) return;
    if (editing && !window.confirm(label("packingDiscard"))) return;
    action();
  };
  const close = () => leave(onClose);
  const changePerson = (change: (person: PackingPerson) => PackingPerson) => {
    if (!draft || !person) return;
    setDraft({ ...draft, people: draft.people.map(p => p.id === person.id ? change(p) : p) });
    setInvalid(false);
  };
  const saveDraft = async () => {
    if (!draft) return;
    if (!validPackingList(draft)) { setInvalid(true); return; }
    if (await state.save(draft)) setDraft(null);
  };
  const reload = () => {
    if (editing && !window.confirm(label("packingDiscard"))) return;
    setDraft(null); setInvalid(false); void state.reload();
  };
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${id}-title`}
    onCancel={event => { event.preventDefault(); close(); }}>
    <div className={styles.shell}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>{label("packingPrepare")}</p><h1 id={`${id}-title`}>{label("packingTitle")}</h1></div>
        {value && <span className={styles.total} aria-label={label("packingTotal")}>
          {count(value.people.flatMap(p => p.groups.flatMap(g => g.items)))}<small>{label("packingPacked")}</small>
        </span>}
        <button className={styles.back} type="button" autoFocus disabled={state.saving} aria-label={label("packingBack")} title={label("packingBack")} onClick={close}>←</button>
      </header>
      {navigation && <div className={styles.navigation}>{navigation(leave, state.saving)}</div>}
      <div className={styles.content}>
        <div className={styles.toolbar}>
          {canEdit && !editing && state.list && <button disabled={disabled} type="button" onClick={() => { setDraft(state.list); setInvalid(false); }}>{label("editMode")}</button>}
          {editing && <><button className={styles.primary} disabled={disabled} onClick={() => void saveDraft()}>{label("packingSave")}</button>
            <button disabled={state.saving} onClick={() => { setDraft(null); setInvalid(false); }}>{label("cancel")}</button></>}
          <span role="status">{state.loading ? label("loading") : state.saving ? label("saving") : state.saved ? label("saved") : ""}</span>
        </div>
        {state.offline && <p role="status" className={styles.notice}>{label("offline")}</p>}
        {(state.error || invalid) && <div className={styles.notice} role="alert">
          <p>{label(invalid || state.error === "invalid" ? "packingInvalid" : state.error === "conflict" ? "packingConflict" : state.error ?? "error")}</p>
          {state.blocked && <p>{label("packingReloadHelp")}</p>}
          <button disabled={state.saving || state.offline || state.loading} onClick={reload}>{label("reload")}</button>
        </div>}
        {value && <>
          <div role="tablist" aria-label={label("packingPeople")} className={styles.tabs}>
            {value.people.map((p, index) => <button key={p.id} type="button" role="tab" id={`${id}-tab-${p.id}`}
              aria-controls={`${id}-panel`} aria-selected={p.id === person?.id} tabIndex={p.id === person?.id ? 0 : -1}
              onClick={() => setSelected(p.id)} onKeyDown={event => {
                const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                if (!offset && event.key !== "Home" && event.key !== "End") return;
                event.preventDefault();
                const next = value.people[event.key === "Home" ? 0 : event.key === "End" ? value.people.length - 1 : (index + offset + value.people.length) % value.people.length];
                setSelected(next.id); document.getElementById(`${id}-tab-${next.id}`)?.focus();
              }}>{p.name || label("packingPerson")}<span>{count(p.groups.flatMap(g => g.items))}</span></button>)}
          </div>
          {editing && <button className={styles.add} disabled={disabled || value.people.length >= 12} onClick={() => {
            const personId = crypto.randomUUID(); setDraft({ ...value, people: [...value.people, { id: personId, name: "", groups: [] }] }); setSelected(personId);
          }}>＋ {label("packingAddPerson")}</button>}
          {!value.people.length && <p className={styles.empty}>{label(canEdit ? "packingEmpty" : "packingEmptyViewer")}</p>}
          {person && <section role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${person.id}`} className={styles.panel}>
            {editing && <div className={styles.editRow}>
              <label>{label("packingPerson")}<input maxLength={80} value={person.name} disabled={disabled} onChange={event => changePerson(p => ({ ...p, name: event.target.value }))}/></label>
              <button disabled={disabled} onClick={() => setDraft({ ...value, people: value.people.filter(p => p.id !== person.id) })}>{label("packingDeletePerson")}</button>
            </div>}
            {!person.groups.length && <p className={styles.empty}>{label("packingNoGroups")}</p>}
            {person.groups.map(group => <section key={group.id} className={styles.group} aria-labelledby={`${id}-group-${group.id}`}>
              <header className={styles.groupHeader}>
                {editing ? <label>{label("packingGroup")}<input id={`${id}-group-${group.id}`} maxLength={100} value={group.name} disabled={disabled}
                  onChange={event => changePerson(p => ({ ...p, groups: p.groups.map(g => g.id === group.id ? { ...g, name: event.target.value } : g) }))}/></label>
                  : <h2 id={`${id}-group-${group.id}`}>{group.name}</h2>}
                <span className={styles.counter}>{count(group.items)}</span>
                {editing && <button disabled={disabled} aria-label={`${label("packingDeleteGroup")} · ${group.name}`} onClick={() => changePerson(p => ({ ...p, groups: p.groups.filter(g => g.id !== group.id) }))}>×</button>}
              </header>
              <ul className={styles.items}>{group.items.map(item => <li key={item.id}>
                {editing ? <><input aria-label={label("packingItem")} maxLength={200} disabled={disabled} value={item.name}
                  onChange={event => changePerson(p => ({ ...p, groups: p.groups.map(g => g.id === group.id ? { ...g, items: g.items.map(i => i.id === item.id ? { ...i, name: event.target.value } : i) } : g) }))}/>
                  <button disabled={disabled} aria-label={`${label("packingDeleteItem")} · ${item.name}`} onClick={() => changePerson(p => ({ ...p, groups: p.groups.map(g => g.id === group.id ? { ...g, items: g.items.filter(i => i.id !== item.id) } : g) }))}>×</button></>
                  : <label className={item.checked ? styles.checked : undefined}><input type="checkbox" checked={item.checked} disabled={!canEdit || disabled}
                    onChange={event => {
                      const control = event.currentTarget;
                      void state.save(checkPackingItem(value, person.id, group.id, item.id, control.checked)).then(() => {
                        requestAnimationFrame(() => { if (control.isConnected && document.activeElement === document.body) control.focus({ preventScroll: true }); });
                      });
                    }}/><span>{item.name}</span></label>}
              </li>)}</ul>
              {!group.items.length && !editing && <p className={styles.empty}>{label("packingNoItems")}</p>}
              {editing && <button className={styles.add} disabled={disabled || group.items.length >= 100 || value.people.flatMap(p => p.groups.flatMap(g => g.items)).length >= 500}
                onClick={() => changePerson(p => ({ ...p, groups: p.groups.map(g => g.id === group.id ? { ...g, items: [...g.items, { id: crypto.randomUUID(), name: "", checked: false }] } : g) }))}>＋ {label("packingAddItem")}</button>}
            </section>)}
            {editing && <button className={styles.add} disabled={disabled || person.groups.length >= 40 || value.people.flatMap(p => p.groups).length >= 100}
              onClick={() => changePerson(p => ({ ...p, groups: [...p.groups, { id: crypto.randomUUID(), name: "", items: [] }] }))}>＋ {label("packingAddGroup")}</button>}
          </section>}
          {!canEdit && <p className={styles.readOnly}>{label("packingReadOnly")}</p>}
        </>}
      </div>
    </div>
  </dialog>;
}
