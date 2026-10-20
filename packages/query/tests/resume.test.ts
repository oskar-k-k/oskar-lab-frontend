import {afterEach, expect, it, vi} from "vitest";
import {subscribeToResume} from "@oskar-lab/query/resume";

afterEach(() => {vi.useRealTimers(); vi.unstubAllGlobals();});

it("coalesces wake events, ignores background events and removes all listeners", () => {
    vi.useFakeTimers();
    const page = Object.assign(new EventTarget(), {visibilityState: "hidden"});
    const browser = new EventTarget();
    vi.stubGlobal("document", page); vi.stubGlobal("window", browser);
    const reload = vi.fn();
    const unsubscribe = subscribeToResume(reload);
    browser.dispatchEvent(new Event("focus"));
    vi.advanceTimersByTime(600);
    expect(reload).not.toHaveBeenCalled();
    page.visibilityState = "visible";
    page.dispatchEvent(new Event("visibilitychange"));
    browser.dispatchEvent(new Event("pageshow"));
    browser.dispatchEvent(new Event("online"));
    vi.advanceTimersByTime(600);
    expect(reload).toHaveBeenCalledTimes(1);
    browser.dispatchEvent(new Event("focus"));
    unsubscribe();
    browser.dispatchEvent(new Event("online"));
    vi.advanceTimersByTime(600);
    expect(reload).toHaveBeenCalledTimes(1);
});
