/**
 * render-fetch.mjs — 用本机 Edge 无头模式渲染 JS 页面。
 *
 * 用法:
 *   node tools/render-fetch.mjs <url> [waitMs]                  # 输出渲染后的 DOM 到 stdout
 *   node tools/render-fetch.mjs <url> [waitMs] --net <正则>      # 同时抓取匹配的网络响应到 tmp-net/
 *   node tools/render-fetch.mjs <url> [waitMs] --scroll           # 先滚动到底触发懒加载
 *   node tools/render-fetch.mjs <url> [waitMs] --eval <表达式>    # 输出表达式求值结果（替代 DOM）
 *   node tools/render-fetch.mjs <url> [waitMs] --scroll --shot <png> [--width 1400]   # 整页截图
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EDGE_CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];

const args = process.argv.slice(2);
const url = args[0];
const waitMs = Number(args[1] || 6000);
const netIdx = args.indexOf('--net');
const netPattern = netIdx >= 0 && args[netIdx + 1] ? new RegExp(args[netIdx + 1], 'i') : null;
const doScroll = args.includes('--scroll');
const evalIdx = args.indexOf('--eval');
const evalExpr = evalIdx >= 0 && args[evalIdx + 1] ? args[evalIdx + 1] : null;
const shotIdx = args.indexOf('--shot');
const shotPath = shotIdx >= 0 && args[shotIdx + 1] ? args[shotIdx + 1] : null;
const widthIdx = args.indexOf('--width');
const shotWidth = widthIdx >= 0 && args[widthIdx + 1] ? Number(args[widthIdx + 1]) : 1400;

if (!url) {
  console.error('usage: node tools/render-fetch.mjs <url> [waitMs] [--net <regex>]');
  process.exit(2);
}

const exe = EDGE_CANDIDATES.find((p) => existsSync(p));
if (!exe) {
  console.error('no Edge/Chrome found');
  process.exit(2);
}

const profile = mkdtempSync(join(tmpdir(), 'render-fetch-'));
const netDir = join(process.cwd(), 'tmp-net');
if (netPattern) mkdirSync(netDir, { recursive: true });

const child = spawn(exe, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  ...(process.argv.includes('--insecure') ? ['--ignore-certificate-errors'] : []),
  `--user-data-dir=${profile}`,
  '--remote-debugging-port=0',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function portFromProfile() {
  const file = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100; i++) {
    if (existsSync(file)) {
      const [port] = readFileSync(file, 'utf8').split('\n');
      if (port) return Number(port);
    }
    await sleep(100);
  }
  throw new Error('DevToolsActivePort not found');
}

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    } else if (msg.method) {
      for (const fn of listeners) fn(msg);
    }
  });
  const ready = new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  return { ready, send, on: (fn) => listeners.push(fn), close: () => ws.close() };
}

let saved = 0;
let browserCdp = null;
try {
  const port = await portFromProfile();
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('no page target');

  browserCdp = cdp(page.webSocketDebuggerUrl);
  const { ready, send, on } = browserCdp;
  await ready;
  await send('Page.enable');
  await send('Runtime.enable');
  if (netPattern) {
    await send('Network.enable');
    const seen = new Set();
    on(async (msg) => {
      if (msg.method !== 'Network.responseReceived') return;
      const { url: rurl, mimeType } = msg.params.response;
      if (!netPattern.test(rurl) || seen.has(msg.params.requestId)) return;
      seen.add(msg.params.requestId);
      try {
        const body = await send('Network.getResponseBody', { requestId: msg.params.requestId });
        const ext = mimeType?.includes('json') ? 'json' : 'txt';
        const name = `net-${String(++saved).padStart(2, '0')}.${ext}`;
        writeFileSync(join(netDir, name), body.body, body.base64Encoded ? 'base64' : 'utf8');
        console.error(`[net] ${name} <- ${rurl}`);
      } catch (e) {
        console.error(`[net] failed ${rurl}: ${e.message}`);
      }
    });
  }
  await send('Page.navigate', { url });
  await sleep(waitMs);
  if (doScroll) {
    await send('Runtime.evaluate', {
      expression: `(async () => {
        for (let i = 0; i < 14; i++) {
          window.scrollBy(0, 1600);
          await new Promise((r) => setTimeout(r, 700));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 800));
        return true;
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
  }
  if (shotPath) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: shotWidth,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(600);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.error(`[shot] ${shotPath}`);
  }
  const res = await send('Runtime.evaluate', {
    expression: evalExpr ?? 'document.documentElement.outerHTML',
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    console.error('eval failed:', res.exceptionDetails.text, res.exceptionDetails.exception?.description ?? '');
    process.exitCode = 1;
  } else {
    const v = res.result.value;
    process.stdout.write(typeof v === 'string' ? v : JSON.stringify(v, null, 2));
  }
} catch (err) {
  console.error('render-fetch failed:', err.message);
  process.exitCode = 1;
} finally {
  if (browserCdp) {
    try {
      await Promise.race([browserCdp.send('Browser.close'), sleep(1200)]);
    } catch {}
    browserCdp.close();
  }
  await sleep(500);

  if (process.platform === 'win32') {
    const ps = "Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($env:RENDER_FETCH_PROFILE) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }";
    spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], {
      env: { ...process.env, RENDER_FETCH_PROFILE: profile },
      stdio: 'ignore',
    });
  }
  if (!child.killed) child.kill('SIGKILL');
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
