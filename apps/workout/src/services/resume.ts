/** Coalesces mobile resume, restored pages and reconnection events; cleanup cancels pending work. */
export function subscribeToResume(callback: () => void): () => void {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const resume = () => {
        if (document.visibilityState === "hidden") return;
        clearTimeout(timer);
        timer = setTimeout(callback, 600);
    };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("pageshow", resume);
    window.addEventListener("focus", resume);
    window.addEventListener("online", resume);
    return () => {
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", resume);
        window.removeEventListener("pageshow", resume);
        window.removeEventListener("focus", resume);
        window.removeEventListener("online", resume);
    };
}
