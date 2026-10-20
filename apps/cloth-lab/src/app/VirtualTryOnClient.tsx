"use client";

import {useQuery, useMutation} from "@tanstack/react-query";
import {workerStatusQuery, generateImage} from "../services/tryOn";
import {useEffect, useId, useMemo, useRef, useState} from "react";
import {useI18n} from "@oskar-lab/i18n/I18nProvider";
import styles from "./VirtualTryOnPage.module.css";

type UploadSlot = "person" | "garment";
type Status = "idle" | "ready" | "generating" | "success" | "error";

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 8 * 1024 * 1024;

/** Provides a focused virtual try-on prototype for a self-hosted AI worker. */
export default function VirtualTryOnClient() {
    const {t} = useI18n();
    const personInputId = useId();
    const garmentInputId = useId();
    const [personImage, setPersonImage] = useState<File | null>(null);
    const [garmentImage, setGarmentImage] = useState<File | null>(null);
    const [personPreview, setPersonPreview] = useState<string | null>(null);
    const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const worker = useQuery(workerStatusQuery());
    const workerStatus = worker.isPending && !worker.isPaused ? "checking" : !worker.isError && worker.data ? "online" : "offline";
    const uploadAbort = useRef<AbortController | null>(null);
    const generation = useMutation({mutationFn: ({person, garment, signal}: {person: File; garment: File; signal: AbortSignal}) =>
        generateImage(person, garment, signal, {generic: t("tryOn.errorGeneric"), invalid: t("tryOn.invalidWorkerResponse")})});
    const personPreviewRef = useRef<string | null>(null);
    const garmentPreviewRef = useRef<string | null>(null);
    const resultImageRef = useRef<string | null>(null);
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState<string | null>(null);

    const ready = personImage !== null && garmentImage !== null;
    const primaryLabel = status === "generating" ? t("tryOn.generating") : t("tryOn.generate");
    const workerStatusText = workerStatus === "online" ? t("tryOn.workerOnline") : workerStatus === "offline" ? t("tryOn.workerOffline") : t("tryOn.workerChecking");
    const statusText = useMemo(() => {
        if (status === "success") return t("tryOn.success");
        if (status === "error") return message ?? t("tryOn.errorGeneric");
        if (ready) return t("tryOn.ready");
        return t("tryOn.waiting");
    }, [message, ready, status, t]);

    useEffect(() => () => {
        uploadAbort.current?.abort();
        if (personPreviewRef.current) URL.revokeObjectURL(personPreviewRef.current);
        if (garmentPreviewRef.current) URL.revokeObjectURL(garmentPreviewRef.current);
        if (resultImageRef.current?.startsWith("blob:")) URL.revokeObjectURL(resultImageRef.current);
    }, []);

    function validateFile(file: File): string | null {
        if (!acceptedImageTypes.includes(file.type)) return t("tryOn.invalidType");
        if (file.size > maxImageSize) return t("tryOn.invalidSize");
        return null;
    }

    function updateImage(slot: UploadSlot, file: File | null): void {
        setResultImage(current => {
            if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
            resultImageRef.current = null;
            return null;
        });
        setMessage(null);
        setStatus(file ? "ready" : "idle");
        if (!file) {
            if (slot === "person") {
                setPersonImage(null);
                setPersonPreview(current => {
                    if (current) URL.revokeObjectURL(current);
                    personPreviewRef.current = null;
                    return null;
                });
            } else {
                setGarmentImage(null);
                setGarmentPreview(current => {
                    if (current) URL.revokeObjectURL(current);
                    garmentPreviewRef.current = null;
                    return null;
                });
            }
            return;
        }

        const error = validateFile(file);
        if (error) {
            setStatus("error");
            setMessage(error);
            return;
        }

        const nextPreview = URL.createObjectURL(file);
        if (slot === "person") {
            setPersonImage(file);
            setPersonPreview(current => {
                if (current) URL.revokeObjectURL(current);
                personPreviewRef.current = nextPreview;
                return nextPreview;
            });
        } else {
            setGarmentImage(file);
            setGarmentPreview(current => {
                if (current) URL.revokeObjectURL(current);
                garmentPreviewRef.current = nextPreview;
                return nextPreview;
            });
        }
    }

    async function generateTryOn(): Promise<void> {
        if (!personImage || !garmentImage || generation.isPending) return;
        setStatus("generating"); setMessage(null); setResultImage(null);
        const controller = new AbortController();
        uploadAbort.current = controller;
        try {
            const image = await generation.mutateAsync({person: personImage, garment: garmentImage, signal: controller.signal});
            if (controller.signal.aborted) return;
            const imageUrl = typeof image === "string" ? image : URL.createObjectURL(image);
            if (resultImageRef.current?.startsWith("blob:")) URL.revokeObjectURL(resultImageRef.current);
            resultImageRef.current = imageUrl;
            setResultImage(imageUrl); setStatus("success");
        } catch (error) {
            if (!controller.signal.aborted) {
                setStatus("error"); setMessage(error instanceof Error ? error.message : t("tryOn.errorGeneric"));
            }
        } finally {
            generation.reset();
            uploadAbort.current = null;
        }
    }

    return (
        <main className={styles.page}>
            <section className={styles.workspace}>
                <header className={styles.hero}>
                    <p>{t("tryOn.kicker")}</p>
                    <div className={styles.titleRow}>
                        <h1>{t("tryOn.title")}</h1>
                        <span className={styles.workerBadge} data-state={workerStatus}>{workerStatusText}</span>
                    </div>
                    <span>{t("tryOn.subtitle")}</span>
                </header>

                <section className={styles.uploadGrid} aria-label={t("tryOn.uploadsLabel")}>
                    <UploadPanel
                        id={personInputId}
                        title={t("tryOn.personTitle")}
                        description={t("tryOn.personDescription")}
                        preview={personPreview}
                        file={personImage}
                        onChange={file => updateImage("person", file)}
                    />
                    <UploadPanel
                        id={garmentInputId}
                        title={t("tryOn.garmentTitle")}
                        description={t("tryOn.garmentDescription")}
                        preview={garmentPreview}
                        file={garmentImage}
                        onChange={file => updateImage("garment", file)}
                    />
                </section>

                <section className={styles.actionBar}>
                    <div role="status" aria-live="polite">
                        <strong>{t("tryOn.status")}</strong>
                        <span>{statusText}</span>
                    </div>
                    <button type="button" disabled={!ready || status === "generating"} onClick={generateTryOn}>
                        {primaryLabel}
                    </button>
                </section>

                <section className={styles.resultArea} aria-label={t("tryOn.resultLabel")}>
                    {resultImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resultImage} alt={t("tryOn.resultAlt")} />
                    ) : (
                        <div className={styles.placeholder}>
                            <span>{t("tryOn.resultPlaceholder")}</span>
                        </div>
                    )}
                </section>

                <aside className={styles.setup}>
                    <h2>{t("tryOn.setupTitle")}</h2>
                    <ul>
                        <li>{t("tryOn.setupWorker")}</li>
                        <li>{t("tryOn.setupEnv")}</li>
                        <li>{t("tryOn.setupSafety")}</li>
                    </ul>
                </aside>
            </section>
        </main>
    );
}

function UploadPanel({
                         id,
                         title,
                         description,
                         preview,
                         file,
                         onChange,
                     }: Readonly<{
    id: string;
    title: string;
    description: string;
    preview: string | null;
    file: File | null;
    onChange: (file: File | null) => void;
}>) {
    const {t} = useI18n();

    return (
        <article className={styles.uploadPanel}>
            <div className={styles.uploadCopy}>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
            <label className={styles.dropzone} htmlFor={id}>
                {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" />
                ) : (
                    <span>{t("tryOn.chooseImage")}</span>
                )}
            </label>
            <input
                id={id}
                type="file"
                accept={acceptedImageTypes.join(",")}
                onChange={event => onChange(event.target.files?.[0] ?? null)}
            />
            <div className={styles.fileRow}>
                <span>{file?.name ?? t("tryOn.noFile")}</span>
                {file && <button type="button" onClick={() => onChange(null)}>{t("tryOn.remove")}</button>}
            </div>
        </article>
    );
}
