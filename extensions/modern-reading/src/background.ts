import {parseSettings} from './model';

const origins = ['http://*/*', 'https://*/*'];
let queue = Promise.resolve();

/** Reconciles persistent automatic injection with saved settings and granted access. */
async function reconcile() {
    const settings = parseSettings((await chrome.storage.local.get('settings')).settings);
    const allowed = await chrome.permissions.contains({origins});
    const registered = await chrome.scripting.getRegisteredContentScripts({ids: ['modern-reading']});
    if (settings.automatic && allowed && !registered.length) {
        await chrome.scripting.registerContentScripts([{id: 'modern-reading', matches: origins, js: ['content.js'], runAt: 'document_idle'}]);
        const tabs = await chrome.tabs.query({url: origins});
        // Existing tabs need injection too; restricted pages may legitimately reject it.
        await Promise.allSettled(tabs.filter(tab => tab.id !== undefined).map(tab =>
            chrome.scripting.executeScript({target: {tabId: tab.id!}, files: ['content.js']})));
    } else if ((!settings.automatic || !allowed) && registered.length) {
        await chrome.scripting.unregisterContentScripts({ids: ['modern-reading']});
    }
    if (settings.automatic && !allowed) await chrome.storage.local.set({settings: {...settings, automatic: false}});
}

function schedule() {
    const work = queue.then(reconcile);
    queue = work.catch(error => console.error('Modern Reading registration failed:', error instanceof Error ? error.message : 'Unknown error'));
    return work;
}
chrome.runtime.onInstalled.addListener(() => { void schedule(); });
chrome.runtime.onStartup.addListener(() => { void schedule(); });
chrome.permissions.onRemoved.addListener(() => { void schedule(); });
chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.settings) void schedule(); });
chrome.runtime.onMessage.addListener((message: unknown, _sender, respond) => {
    if (!message || typeof message !== 'object' || !('type' in message) || message.type !== 'modern-reading:reconcile') return;
    void schedule().then(() => respond({ok: true}), () => respond({ok: false}));
    return true;
});
