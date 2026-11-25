"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Platform links cross independent app boundaries. */
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
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/">OSKAR LAB</a>
        <strong>TravelTime</strong>
        <a href="/account">{label("accountLink")}</a>
        {trip && !auth && (
          <nav className={styles.headerActions} aria-label={label("timeline")}>
            <button
              onClick={() => {
                ++requestGeneration.current;
                ++documentGeneration.current;
                window.history.replaceState(null, "", appPath("/"));
                setNewTrip(false);
                setTrip(null);
                setEditingTimeline(false);
                setSelected(null);
                setEdit(undefined);
                void loadTrips();
              }}
            >
              {label("back")}
            </button>
            {trip.canEdit && (
              <button
                aria-pressed={editingTimeline}
                onClick={() => {
                  setEditingTimeline(!editingTimeline);
                  setNewTrip(false);
                  setEdit(undefined);
                  setShare(false);
                  setSelected(null);
                }}
              >
                {label(editingTimeline ? "doneEditing" : "editTimeline")}
              </button>
            )}
            {trip.canEdit && editingTimeline && (
              <>
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
              </>
            )}
          </nav>
        )}
      </header>
      <main className={styles.main}>
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
            {success && !error && <p role="status">{label("saved")}</p>}
            {error && (
              <div role="alert" className={styles.notice}>
                <p>{label(error)}</p>
                <button
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
                <h2>{label("trips")}</h2>
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
                onCancel={() => setNewTrip(false)}
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
            {trip && edit !== undefined && (
              <BookingForm
                key={edit?.id ?? "new"}
                entry={edit}
                startDate={trip.startDate}
                busy={writeDisabled}
                onCancel={() => setEdit(undefined)}
                onSave={(input) =>
                  mutate(async () => {
                    await travelRequest(
                      `/${trip.id}/entries${edit ? "/" + edit.id : ""}`,
                      edit ? "PUT" : "POST",
                      input,
                    );
                    setEdit(undefined);
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
            {trip && (
              <TravelTimeline
                trip={trip}
                entries={entries}
                now={now}
                loading={loading}
                editing={editingTimeline}
                editable={trip.canEdit && editingTimeline}
                disabled={writeDisabled}
                onDocuments={(entry) => void showDocuments(entry)}
                onEdit={setEdit}
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
    </div>
  );
}
