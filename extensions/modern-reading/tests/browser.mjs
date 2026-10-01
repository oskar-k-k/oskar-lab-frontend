import {chromium, expect} from '@playwright/test';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {resolve} from 'node:path';
import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';

const text = 'A quieter way to read. Follow the beginnings of these words and find a comfortable rhythm. This paragraph is deliberately long enough to exercise automatic paragraph detection.';
const server = createServer((_request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    response.end(`<!doctype html><html lang="en"><title>Reading fixture</title><body><main><h1>Reading fixture</h1><p id="article">${text} <a href="#more">Continue reading</a></p><p>Short text.</p><div contenteditable="true"><p>${text}</p></div><pre>${text}</pre></main></body></html>`);
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const address = server.address();
const url = `http://127.0.0.1:${address.port}`;
const extension = resolve('test-results/extension');
await mkdir(extension, {recursive: true});
await cp('dist', extension, {recursive: true});
const manifest = JSON.parse(await readFile('dist/manifest.json', 'utf8'));
expect(manifest.host_permissions).toBeUndefined();
// Headless tabs cannot invoke the toolbar's activeTab grant or native permission UI.
// Grant hosts only to this disposable test copy; production remains opt-in.
manifest.host_permissions = manifest.optional_host_permissions;
await writeFile(resolve(extension, 'manifest.json'), JSON.stringify(manifest));
let context;
try {
    context = await chromium.launchPersistentContext('', {
        channel: process.env.MODERN_READING_BROWSER ?? 'chromium', headless: true,
        args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, '--auto-confirm-extension-installs=accept'],
    });
    const errors = [];
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.goto(url);
    await page.bringToFront();
    const target = await worker.evaluate(async () => (await chrome.tabs.query({active: true, currentWindow: true}))[0]);
    const popup = await context.newPage();
    // Opening the popup as a test tab changes the active tab; retain the real article target.
    await popup.addInitScript(({id, url}) => {
        const query = chrome.tabs.query.bind(chrome.tabs);
        chrome.tabs.query = options => options.active ? Promise.resolve([{id, url}]) : query(options);
    }, {id: target.id, url});
    await page.bringToFront();
    await popup.goto(`chrome-extension://${worker.url().split('/')[2]}/popup.html`);
    await expect(popup.locator('#enabled')).toBeEnabled();
    await popup.locator('#enabled').focus();
    await popup.keyboard.press('Space');
    await expect(popup.locator('#enabled')).toBeChecked();
    await expect(page.locator('#article [data-modern-reading]').first()).toBeAttached();
    await expect(page.locator('#article')).toHaveText(`${text} Continue reading`);
    await expect(page.locator('pre [data-modern-reading], [contenteditable] [data-modern-reading]')).toHaveCount(0);
    await popup.locator('#locale').selectOption('de');
    await expect(popup.locator('html')).toHaveAttribute('lang', 'de');
    await expect(popup.locator('#status')).toContainText('Lesemodus aktiv');
    await popup.locator('#fraction').fill('70');
    await popup.locator('#fraction').dispatchEvent('change');
    await expect(popup.locator('#fraction-value')).toHaveText('70%');
    await popup.setViewportSize({width: 380, height: 850});
    await mkdir('test-results', {recursive: true});
    await popup.screenshot({path: 'test-results/popup-de.png', fullPage: true});
    await popup.setViewportSize({width: 320, height: 850});
    expect(await popup.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await popup.screenshot({path: 'test-results/popup-narrow.png', fullPage: true});
    await popup.locator('#enabled').uncheck();
    await expect(page.locator('[data-modern-reading]')).toHaveCount(0);
    await popup.locator('#locale').selectOption('en');
    await popup.evaluate(() => { chrome.permissions.request = async () => false; });
    await popup.locator('#automatic').click();
    await expect(popup.locator('#status')).toContainText('Website access was not granted');
    await expect(popup.locator('#automatic')).not.toBeChecked();
    await popup.reload();
    await popup.locator('#automatic').check();
    await expect(popup.locator('#automatic')).toBeChecked();
    await expect(page.locator('#article [data-modern-reading]').first()).toBeAttached();
    await popup.locator('#excluded').check();
    await expect(page.locator('[data-modern-reading]')).toHaveCount(0);
    const unsupported = await context.newPage();
    await unsupported.goto(`chrome-extension://${worker.url().split('/')[2]}/popup.html`);
    await expect(unsupported.locator('#enabled')).toBeDisabled();
    await expect(unsupported.locator('#status')).toContainText('This page cannot be changed');
    await popup.locator('#excluded').uncheck();
    await expect(page.locator('#article [data-modern-reading]').first()).toBeAttached();
    await popup.close();
    await page.reload();
    await expect(page.locator('#article [data-modern-reading]').first()).toBeAttached();
    await page.evaluate(value => {
        const p = document.createElement('p'); p.id = 'dynamic'; p.textContent = value;
        document.querySelector('main').append(p);
    }, text);
    await expect(page.locator('#dynamic [data-modern-reading]')).toBeAttached();
    await worker.evaluate(async () => {
        const {settings} = await chrome.storage.local.get('settings');
        await chrome.storage.local.set({settings: {...settings, automatic: false}});
    });
    await expect(page.locator('[data-modern-reading]')).toHaveCount(0);
    expect(errors).toEqual([]);
    console.log('Browser checks passed: manual toggle, German UI, strength, narrow layout, automatic registration, exclusions, reload, dynamic text, restoration and no page errors. Native permission prompts require a manual Chrome check.');
} finally {
    await context?.close();
    server.close();
}
