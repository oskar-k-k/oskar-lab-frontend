"use client";

import RangeSlider from "@oskar-lab/ui/RangeSlider/RangeSlider";
import {useState} from "react";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import {isPlan, moveEntry, newEntry, type Entry, type Exercise, type Plan} from "../model/workout";
import {trackingMode} from "../model/tracking";
import styles from "./Workout.module.css";

type Props = {initial: Plan; catalog: Exercise[]; busy: boolean; onSave: (plan: Plan) => void; onCancel: () => void};


/** Edits an isolated draft; cancel and failed saves never mutate persisted data. */
export default function PlanEditor({initial, catalog, busy, onSave, onCancel}: Props) {
    const {t, locale} = useI18n();
    const [draft, setDraft] = useState(initial);
    const [invalid, setInvalid] = useState(false);
    const [selected, setSelected] = useState(catalog[0]?.id ?? "");
    function update(index: number, change: Partial<Entry>) {
        setDraft(current => ({...current, exercises: current.exercises.map((entry, i) => i === index ? {...entry, ...change} : entry)}));
    }
    return <form className={styles.editor} onSubmit={event => {
        event.preventDefault();
        if (!isPlan(draft)) {setInvalid(true); return;}
        setInvalid(false); onSave(draft);
    }}>
        <fieldset disabled={busy}>
            <legend className={styles.sectionTitle}>{t("workout.editor")}</legend>
            <div className={styles.fields}>
                <label>{t("workout.name")}<input autoFocus required maxLength={120} value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} /></label>
                <label>{t("workout.notes")}<textarea maxLength={2000} value={draft.notes} onChange={e => setDraft({...draft, notes: e.target.value})} /></label>
            </div>
            <p className={styles.muted}>{t("workout.rangeHint")}</p>
            {draft.exercises.map((entry, index) => <fieldset className={styles.entryEditor} key={index}>
                <legend>{index + 1}. {catalog.find(e => e.id === entry.exerciseId)?.[locale === "de" ? "nameDe" : "name"]}</legend>
                <div className={styles.fields}>
                    <label>{t("workout.exercise")}<select value={entry.exerciseId} onChange={e => update(index, {exerciseId: e.target.value})}>
                        {catalog.map(e => <option key={e.id} value={e.id}>{locale === "de" ? e.nameDe : e.name}</option>)}
                    </select></label>
                    <label>{t("workout.mode")}<select value={entry.mode} onChange={e => {
                        const mode = e.target.value as Entry["mode"];
                        update(index, {mode, targetMin: mode === "unspecified" ? null : 1, targetMax: mode === "unspecified" ? null : 1});
                    }}>{(["reps", "seconds", "unspecified"] as const).map(mode => <option key={mode} value={mode}>{t(`workout.${mode}`)}</option>)}</select></label>
                </div>
                <label>{t("workout.trackingType")}<select value={trackingMode(entry)} onChange={event => update(index, {trackingMode: event.target.value as Entry["trackingMode"]})}>
                    {(["reps", "seconds", "weighted"] as const).map(mode => <option key={mode} value={mode}>{t(`workout.track.${mode}`)}</option>)}
                </select></label>
                <div className={styles.rangeFields}>
                    <RangeSlider label={t("workout.sets")} minLabel={t("common.minimum")} maxLabel={t("common.maximum")} min={1} max={100} sliderMax={20}
                        value={[entry.setsMin, entry.setsMax]} onChange={([setsMin, setsMax]) => update(index, {setsMin, setsMax})} />
                    {entry.mode !== "unspecified" && <RangeSlider label={t(entry.mode === "seconds" ? "workout.durationSeconds" : "workout.reps")}
                        minLabel={t("common.minimum")} maxLabel={t("common.maximum")} min={1} max={86400} sliderMax={entry.mode === "seconds" ? 600 : 30}
                        value={[entry.targetMin ?? 1, entry.targetMax ?? 1]} onChange={([targetMin, targetMax]) => update(index, {targetMin, targetMax})} />}
                    <label className={styles.openRest}><input type="checkbox" checked={entry.restMin === null}
                        onChange={event => update(index, {restMin: event.target.checked ? null : 60, restMax: event.target.checked ? null : 60})} />{t("workout.restUnspecified")}</label>
                    {entry.restMin !== null && <RangeSlider label={t("workout.restSeconds")} minLabel={t("common.minimum")} maxLabel={t("common.maximum")}
                        min={0} max={86400} sliderMax={300} value={[entry.restMin, entry.restMax ?? entry.restMin]} onChange={([restMin, restMax]) => update(index, {restMin, restMax})} />}
                </div>
                <div className={styles.fields}>
                    <label>{t("workout.superset")}<input maxLength={32} value={entry.superset} onChange={e => update(index, {superset: e.target.value})} /></label>
                    <label>{t("workout.notes")}<textarea maxLength={1000} value={entry.notes} onChange={e => update(index, {notes: e.target.value})} /></label>
                </div>
                <div className={styles.actions}>
                    <button type="button" disabled={index === 0} onClick={() => setDraft({...draft, exercises: moveEntry(draft.exercises, index, index - 1)})}>{t("workout.up")}</button>
                    <button type="button" disabled={index === draft.exercises.length - 1} onClick={() => setDraft({...draft, exercises: moveEntry(draft.exercises, index, index + 1)})}>{t("workout.down")}</button>
                    <button type="button" onClick={() => setDraft({...draft, exercises: draft.exercises.filter((_, i) => i !== index)})}>{t("workout.remove")}</button>
                </div>
            </fieldset>)}
            <div className={styles.add}>
                <label>{t("workout.exercise")}<select value={selected} onChange={e => setSelected(e.target.value)}>{catalog.map(e => <option key={e.id} value={e.id}>{locale === "de" ? e.nameDe : e.name}</option>)}</select></label>
                <button type="button" disabled={!selected || draft.exercises.length >= 100} onClick={() => setDraft({...draft, exercises: [...draft.exercises, newEntry(selected)]})}>{t("workout.add")}</button>
            </div>
            <p className={styles.muted}>{t("workout.supersetHint")}</p>
            {invalid && <p role="alert" className={styles.error}>{t("workout.invalid")}</p>}
            <div className={styles.actions}>
                <button className={styles.primary} type="submit">{t(busy ? "workout.saving" : "workout.save")}</button>
                <button type="button" onClick={() => {
                    if (JSON.stringify(draft) === JSON.stringify(initial) || window.confirm(t("workout.discard"))) onCancel();
                }}>{t("workout.cancel")}</button>
            </div>
        </fieldset>
    </form>;
}
