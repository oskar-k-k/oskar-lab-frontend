"use client";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@oskar-lab/i18n/I18nProvider";
import type { TranslationKey } from "@oskar-lab/i18n/messages";
import type { components } from "@oskar-lab/api/backend";
import { appPath } from "@oskar-lab/config/paths";
import { travelRequest, TravelError } from "../services/client";
import TravelTimeline from "./TravelTimeline";
import TripForm from "./TripForm";
import BookingForm from "./BookingForm";
import StationTimeEditor from "./StationTimeEditor";
import PackingListDialog from "./PackingListDialog";
import TravelNavigation, { type TravelSection } from "./TravelNavigation";
import SavedPlaces from "./SavedPlaces";
import styles from "./Travel.module.css";
type Trip = components["schemas"]["TravelTrip"];
export type Entry = components["schemas"]["TravelEntry"];
type Attachment = components["schemas"]["TravelAttachment"];
type Viewer = components["schemas"]["TravelViewer"];
/** Isolates in-memory trip state whenever the central account identity changes. */
export default function TravelWorkspace() {
  const { data: session, status } = useSession();
  const { t } = useI18n();
  if (status === "loading")
    return (
      <main className={styles.page}>
        <p role="status">{t("travel.loading")}</p>
      </main>
    );
  return <TravelWorkspaceContent key={session?.user?.id ?? "anonymous"} />;
}

function TravelWorkspaceContent() {
  const { t, locale } = useI18n();
  const label = (key: string) => t(("travel." + key) as TranslationKey);
  const [trips, setTrips] = useState<Trip[]>([]),
    [trip, setTrip] = useState<Trip | null>(null),
    [entries, setEntries] = useState<Entry[]>([]);
  const requestGeneration = useRef(0);
  const documentGeneration = useRef(0);
  const [editingTimeline, setEditingTimeline] = useState(false);
  const [packingOpen, setPackingOpen] = useState(false);
  const [section, setSection] = useState<TravelSection>("trips");
  const [draftDirty, setDraftDirty] = useState(false);
  const [timeEdit, setTimeEdit] = useState<{entry: Entry; point: Entry["points"][number]} | null>(null);
  const [ambientMotion, setAmbientMotion] = useState(true);
  const [success, setSuccess] = useState(false);
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [auth, setAuth] = useState(false),
    [offline, setOffline] = useState(false);
  const [page, setPage] = useState(0),
    [more, setMore] = useState(false),
    [newTrip, setNewTrip] = useState(false),
    [edit, setEdit] = useState<Entry | null | undefined>(undefined),
    [share, setShare] = useState(false);
  const [viewers, setViewers] = useState<Viewer[]>([]),
    [selected, setSelected] = useState<Entry | null>(null),
    [documents, setDocuments] = useState<Attachment[]>([]);
  const report = useCallback((reason: unknown) => {
    setAuth(reason instanceof TravelError && reason.status === 401);
    setError(
      reason instanceof TravelError && reason.status === 409
        ? "conflict"
        : reason instanceof TravelError && [400, 422].includes(reason.status)
          ? "invalid"
          : reason instanceof TravelError && reason.status === 403
            ? "denied"
            : "error",
    );
  }, []);
  const loadTrips = useCallback(
    async (next = 0) => {
      setLoading(true);
      setError("");
      try {
        const data = await travelRequest<
          components["schemas"]["TravelTripPage"]
        >(`?page=${next}`);
        setTrips((previous) =>
          next ? [...previous, ...data.trips] : data.trips,
        );
        setMore(data.hasMore);
        setPage(next);
        setAuth(false);
      } catch (reason) {
        report(reason);
      } finally {
        setLoading(false);
      }
    },
    [report],
  );
  const openTrip = useCallback(
    async (value: Pick<Trip, "id">) => {
      const generation = ++requestGeneration.current;
      setLoading(true);
      setError("");
      setSelected(null);
      setTimeEdit(null);
      setPackingOpen(false); setSection("timeline"); setDraftDirty(false);
      ++documentGeneration.current;
      setShare(false);
      try {
        const current = await travelRequest<Trip>(`/${value.id}`);
        if (generation !== requestGeneration.current) return;
        setTrip(current);
        setEntries([]);
        const all: Entry[] = [];
        for (let p = 0; p <= 50; p++) {
          const data = await travelRequest<
            components["schemas"]["TravelEntryPage"]
          >(`/${value.id}/entries?page=${p}`);
          if (generation !== requestGeneration.current) return;
          all.push(...data.entries);
          setEntries([...all]);
          if (!data.hasMore) break;
        }
        if (generation !== requestGeneration.current) return;
        window.history.replaceState(
          null,
          "",
          appPath("/") + "?trip=" + current.id,
        );
        setTrip(current);
        setEntries(all);
      } catch (reason) {
        if (generation === requestGeneration.current) report(reason);
      } finally {
        if (generation === requestGeneration.current) setLoading(false);
      }
    },
    [report],
  );
  useEffect(() => {
    const start = window.setTimeout(() => {
      void loadTrips();
      const initial = new URL(window.location.href).searchParams.get("trip");
      if (
        initial &&
        /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(initial)
      )
        void openTrip({ id: initial });
      setNow(Date.now());
      setOffline(!navigator.onLine);
    }, 0);
    const clock = window.setInterval(() => setNow(Date.now()), 60000);
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(clock);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [loadTrips, openTrip]);
  async function mutate(action: () => Promise<void>) {
    if (busy || offline) return;
    setBusy(true);
    setSuccess(false);
    setError("");
    try {
      await action();
      setSuccess(true);
    } catch (reason) {
      report(reason);
    } finally {
      setBusy(false);
    }
  }
  async function showDocuments(entry: Entry) {
    const generation = ++documentGeneration.current;
    setSelected(entry);
    setDocuments([]);
    setLoading(true);
    try {
      const values = await travelRequest<Attachment[]>(
        `/${entry.tripId}/entries/${entry.id}/attachments`,
      );
      if (generation === documentGeneration.current) setDocuments(values);
    } catch (reason) {
      if (generation === documentGeneration.current) report(reason);
    } finally {
      if (generation === documentGeneration.current) setLoading(false);
    }
  }
  const writeDisabled =
    busy ||
    offline ||
    error === "error" ||
    error === "conflict" ||
    error === "denied";
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(value + "T12:00:00Z"));
  function navigate(next: TravelSection) {
    if (busy || (next !== "trips" && !trip) || (next === "add" && !trip?.canEdit)) return;
    if (next === section && !packingOpen) return;
    if (draftDirty && !window.confirm(label("discardChanges"))) return;
    setDraftDirty(false); setSuccess(false); setTimeEdit(null); setNewTrip(false); setShare(false); setSelected(null); setEdit(undefined);
    if (next === "packing") { setSection("timeline"); setPackingOpen(true); return; }
    setPackingOpen(false); setSection(next);
    if (next === "trips") {
      ++requestGeneration.current; ++documentGeneration.current;
      setTrip(null); setEditingTimeline(false);
      window.history.replaceState(null, "", appPath("/")); void loadTrips();
    }
    if (next === "add") setEdit(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return (
    <div className={`${styles.page} ${trip && ambientMotion ? styles.ambientMotion : ""}`}>
      <header className={styles.header}>
        <a className={styles.platformLink} href={appPath("/")} onClick={event => { event.preventDefault(); navigate("trips"); }}>TravelTime</a>
        {!auth && <TravelNavigation active={packingOpen ? "packing" : section} hasTrip={Boolean(trip)} canEdit={Boolean(trip?.canEdit)} disabled={busy} onNavigate={navigate} />}
        <a className={styles.accountLink} href="/account" aria-label={label("accountLink")} title={label("accountLink")}><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="10" cy="6" r="3"/><path d="M4 18v-2a6 6 0 0 1 12 0v2"/></svg></a>
      </header>
      {!auth && <div className={styles.mobileNavigation}><TravelNavigation active={packingOpen ? "packing" : section} hasTrip={Boolean(trip)} canEdit={Boolean(trip?.canEdit)} disabled={busy} onNavigate={navigate} /></div>}
      {trip && timeEdit && editingTimeline && trip.canEdit && <StationTimeEditor
        entry={timeEdit.entry} point={timeEdit.point} disabled={writeDisabled}
        onClose={() => setTimeEdit(null)}
        onSave={async input => {
          if (writeDisabled || !trip.canEdit || !editingTimeline) throw new TravelError(403, "forbidden");
          const generation = requestGeneration.current;
          setBusy(true); setSuccess(false); setError("");
          try {
            const saved = await travelRequest<Entry>(`/${trip.id}/entries/${timeEdit.entry.id}`, "PUT", input);
            if (generation !== requestGeneration.current) return;
            setEntries(previous => previous.map(entry => entry.id === saved.id ? saved : entry));
            setTimeEdit(null); setSuccess(true);
          } catch (reason) { report(reason); throw reason; }
          finally { setBusy(false); }
        }} />}
      <main className={styles.main}>
        {trip && !auth && section === "timeline" && (
          <nav className={styles.timelineTools} aria-label={label("tripActions")}>
            {trip.canEdit && (
              <button
                className={styles.editModeToggle}
                aria-label={label("editMode")} title={label("editMode")}
                aria-pressed={editingTimeline}
                onClick={() => {
                  setEditingTimeline(!editingTimeline);
                  setTimeEdit(null);
                  setNewTrip(false);
                  setEdit(undefined);
                  setShare(false);
                  setSelected(null);
                }}
              >
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">{editingTimeline ? <path d="m4 10 4 4 8-9"/> : <path d="m4 13-1 4 4-1L17 6l-3-3Z M12 5l3 3"/>}</svg>
                <span className={styles.editModeText}>{label("editMode")}</span>
              </button>
            )}
            {trip.canEdit && editingTimeline && (
              <details className={styles.headerMenu}>
                <summary aria-label={label("tripActions")} title={label("tripActions")}>···</summary>
                <div>
                <button
                  className={styles.primary}
                  disabled={writeDisabled}
                  onClick={() => {
                    setEdit(null);
                    setNewTrip(false);
                  }}
                >
                  ＋ {label("add")}
                </button>
                <button
                  disabled={writeDisabled}
                  onClick={() => {
                    setNewTrip(true);
                    setEdit(undefined);
                  }}
                >
                  {label("editTrip")}
                </button>
                <button
                  disabled={writeDisabled}
                  onClick={() =>
                    void mutate(async () => {
                      setViewers(
                        await travelRequest<Viewer[]>(
                          `/${trip.id}/viewers`,
                        ),
                      );
                      setShare(!share);
                    })
                  }
                >
                  {label("share")}
                </button>
                <button
                  disabled={writeDisabled}
                  onClick={() => {
                    if (window.confirm(label("confirmDelete")))
                      void mutate(async () => {
                        await travelRequest(
                          `/${trip.id}?version=${trip.version}`,
                          "DELETE",
                        );
                        setTrip(null);
                        setNewTrip(false);
                        window.history.replaceState(
                          null,
                          "",
                          appPath("/"),
                        );
                        await loadTrips();
                      });
                  }}
                >
                  {label("deleteTrip")}
                </button>
                </div>
              </details>
            )}
            <button
              className={styles.motionControl}
              aria-label={label(ambientMotion ? "pauseAtmosphere" : "resumeAtmosphere")}
              title={label(ambientMotion ? "pauseAtmosphere" : "resumeAtmosphere")}
              aria-pressed={!ambientMotion}
              onClick={() => setAmbientMotion(!ambientMotion)}
            >
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                {ambientMotion ? <path d="M7 5v10M13 5v10" /> : <path d="m7 4 8 6-8 6Z" />}
              </svg>
              <span className={styles.motionLabel}>{label(ambientMotion ? "pauseAtmosphere" : "resumeAtmosphere")}</span>
            </button>
          </nav>
        )}
        {!trip && (
          <section className={styles.hero}>
            <p className={styles.eyebrow}>TRAVELTIME</p>
            <h1>{label("title")}</h1>
            <p>{label("intro")}</p>
          </section>
        )}
        {offline && (
          <p role="status" className={styles.notice}>
            {label("offline")}
          </p>
        )}
        {auth ? (
          <section className={styles.empty}>
            <h2>{label("signIn")}</h2>
            <p>{label("signInText")}</p>
            <a
              className={styles.primary}
              href={`/account?returnTo=${encodeURIComponent(appPath("/"))}`}
            >
              {label("account")}
            </a>
          </section>
        ) : (
          <>
            {success && !error && <p className={styles.saveToast} role="status">{label("saved")}</p>}
            {error && (
              <div role="alert" className={styles.notice}>
                <p>{label(error)}</p>
                <button
                  data-travel-reload
                  disabled={busy || offline}
                  onClick={() => {
                    setEdit(undefined);
                    setNewTrip(false);
                    setSelected(null);
                    ++documentGeneration.current;
                    if (trip) void openTrip(trip);
                    else void loadTrips();
                  }}
                >
                  {label("reload")}
                </button>
              </div>
            )}
            {loading && <p role="status">{label("loading")}</p>}
            {!trip && (
              <div className={styles.toolbar}>
                <h2>{label("trips")}</h2><a href="/account">{label("accountLink")}</a>
                <button
                  className={styles.primary}
                  disabled={writeDisabled}
                  onClick={() => setNewTrip(!newTrip)}
                >
                  ＋ {label("newTrip")}
                </button>
              </div>
            )}
            {newTrip && (
              <TripForm
                key={trip?.id ?? "new-trip"}
                trip={trip}
                busy={writeDisabled}
                onDirtyChange={() => setDraftDirty(true)}
                onCancel={() => { setNewTrip(false); setDraftDirty(false); }}
                onSave={(input) =>
                  mutate(async () => {
                    const value = await travelRequest<Trip>(
                      trip ? `/${trip.id}` : "",
                      trip ? "PUT" : "POST",
                      input,
                    );
                    setNewTrip(false);
                    await loadTrips();
                    await openTrip(value);
                  })
                }
              />
            )}
            {!trip && (
              <>
                <div className={styles.tripGrid}>
                  {trips.map((value) => (
                    <button
                      className={styles.tripCard}
                      key={value.id}
                      disabled={busy || loading}
                      onClick={() => void openTrip(value)}
                    >
                      <span>↗</span>
                      <h2>{value.title}</h2>
                      <p>
                        {date(value.startDate)} — {date(value.endDate)}
                      </p>
                      {!value.canEdit && <small>{label("viewOnly")}</small>}
                    </button>
                  ))}
                </div>
                {!loading && !error && trips.length === 0 && (
                  <section className={styles.empty}>
                    <h2>{label("empty")}</h2>
                    <p>{label("emptyText")}</p>
                  </section>
                )}
                {more && (
                  <button
                    disabled={loading}
                    onClick={() => void loadTrips(page + 1)}
                  >
                    {label("more")}
                  </button>
                )}
              </>
            )}
            {trip && share && (
              <section className={styles.panel}>
                <h2>{label("share")}</h2>
                <p>{label("shareText")}</p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const email = new FormData(form).get("email");
                    void mutate(async () => {
                      await travelRequest(`/${trip.id}/viewers`, "POST", {
                        email,
                      });
                      setViewers(await travelRequest(`/${trip.id}/viewers`));
                      form.reset();
                    });
                  }}
                >
                  <label>
                    {label("email")}
                    <input name="email" type="email" required maxLength={254} />
                  </label>
                  <button disabled={writeDisabled}>{label("invite")}</button>
                </form>
                {viewers.length === 0 && <p>{label("noViewers")}</p>}
                {viewers.map((viewer) => (
                  <div className={styles.toolbar} key={viewer.id}>
                    <span>{viewer.email}</span>
                    <button
                      disabled={writeDisabled}
                      onClick={() =>
                        void mutate(async () => {
                          await travelRequest(
                            `/${trip.id}/viewers/${viewer.id}`,
                            "DELETE",
                          );
                          setViewers((previous) =>
                            previous.filter((v) => v.id !== viewer.id),
                          );
                        })
                      }
                    >
                      {label("remove")}
                    </button>
                  </div>
                ))}
              </section>
            )}
            {trip && section !== "saved" && edit !== undefined && (
              <BookingForm
                key={edit?.id ?? "new"}
                entry={edit}
                startDate={trip.startDate}
                busy={writeDisabled}
                onDirtyChange={() => setDraftDirty(true)}
                onCancel={() => { setEdit(undefined); setDraftDirty(false); setSection("timeline"); }}
                onSave={(input) =>
                  mutate(async () => {
                    await travelRequest(
                      `/${trip.id}/entries${edit ? "/" + edit.id : ""}`,
                      edit ? "PUT" : "POST",
                      input,
                    );
                    setEdit(undefined); setDraftDirty(false);
                    await openTrip(trip);
                  })
                }
              />
            )}
            {trip && selected && (
              <section className={styles.panel}>
                <div className={styles.toolbar}>
                  <h2>
                    {selected.title} · {label("documents")}
                  </h2>
                  <button
                    onClick={() => {
                      setSelected(null);
                      ++documentGeneration.current;
                    }}
                  >
                    {label("cancel")}
                  </button>
                </div>
                <p>{label("uploadHint")}</p>
                {trip.canEdit && (
                  <label>
                    {label("upload")}
                    <input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg"
                      disabled={writeDisabled}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (!file) return;
                        if (
                          file.size > 5 * 1024 * 1024 ||
                          ![
                            "application/pdf",
                            "image/png",
                            "image/jpeg",
                          ].includes(file.type)
                        ) {
                          setError("fileTooLarge");
                          return;
                        }
                        const form = new FormData();
                        form.set("file", file);
                        void mutate(async () => {
                          await travelRequest(
                            `/${trip.id}/entries/${selected.id}/attachments`,
                            "POST",
                            form,
                          );
                          await showDocuments(selected);
                        });
                      }}
                    />
                  </label>
                )}
                {!loading && documents.length === 0 && (
                  <p>{label("noDocuments")}</p>
                )}
                {documents.map((document) => (
                  <div className={styles.toolbar} key={document.id}>
                    <a
                      href={appPath(
                        `/api/travel/${trip.id}/entries/${selected.id}/attachments/${document.id}`,
                      )}
                    >
                      {document.filename} ↗
                    </a>
                    <small>{Math.ceil(document.size / 1024)} KB</small>
                    {trip.canEdit && (
                      <button
                        disabled={writeDisabled}
                        onClick={() => {
                          if (window.confirm(label("confirmDelete")))
                            void mutate(async () => {
                              await travelRequest(
                                `/${trip.id}/entries/${selected.id}/attachments/${document.id}`,
                                "DELETE",
                              );
                              await showDocuments(selected);
                            });
                        }}
                      >
                        {label("delete")}
                      </button>
                    )}
                  </div>
                ))}
              </section>
            )}
            {trip && section === "saved" && <SavedPlaces key={trip.id} tripId={trip.id} canEdit={trip.canEdit} onDirtyChange={setDraftDirty} onBusyChange={setBusy} />}
            {trip && section === "timeline" && (
              <TravelTimeline
                trip={trip}
                entries={entries}
                now={now}
                loading={loading}
                editing={editingTimeline}
                editable={trip.canEdit && editingTimeline}
                disabled={writeDisabled}
                onEditTime={(entry, point) => setTimeEdit({entry, point})}
                onDocuments={(entry) => void showDocuments(entry)}
                onEdit={entry => { setEdit(entry); setDraftDirty(false); }}
                onDelete={(entry) => {
                  if (window.confirm(label("confirmDelete")))
                    void mutate(async () => {
                      await travelRequest(
                        `/${trip.id}/entries/${entry.id}?version=${entry.version}`,
                        "DELETE",
                      );
                      await openTrip(trip);
                    });
                }}
              />
            )}
          </>
        )}
      </main>
      {trip && !auth && packingOpen && <PackingListDialog key={trip.id} tripId={trip.id} canEdit={trip.canEdit} onClose={() => setPackingOpen(false)}
        navigation={(leave, saving) => <TravelNavigation active="packing" hasTrip canEdit={trip.canEdit} disabled={saving} onNavigate={next => { if (next !== "packing") leave(() => navigate(next)); }} />} />}
    </div>
  );
}
