/**
 * fetch-autohome-spec.mjs — 从汽车之家「参数配置」接口抓取某个车系的完整参配表。
 *
 * 用法:
 *   node tools/fetch-autohome-spec.mjs <seriesId> [year] [--json]
 *   例: node tools/fetch-autohome-spec.mjs 6962 2024          # 小米SU7 2024款(停售)
 *       node tools/fetch-autohome-spec.mjs 6962 --json        # 当前在售款(JSON)
 *
 * 接口: https://www.autohome.com.cn/web-main/car/param/getParamConf
 *       返回 result.titlelist(参配项定义) + result.datalist(每个车型的值)。
 *       数据仅作资料整理，务必与官方口径交叉核对。
 */
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const positional = argv.filter((a) => !a.startsWith('--'));
const [seriesId, yearArg] = positional;
const asJson = flags.has('--json');

if (!seriesId) {
  console.error('usage: node tools/fetch-autohome-spec.mjs <seriesId> [year] [--json]');
  process.exit(2);
}
const year = yearArg && /^\d{4}$/.test(yearArg) ? yearArg : null;

const url = new URL('https://www.autohome.com.cn/web-main/car/param/getParamConf');
url.searchParams.set('mode', '1');
url.searchParams.set('site', '1');
url.searchParams.set('seriesid', seriesId);
if (year) url.searchParams.set('year', year);

const res = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Referer: `https://www.autohome.com.cn/config/series/${seriesId}.html`,
    Accept: 'application/json, text/plain, */*',
  },
});
if (!res.ok) {
  console.error(`HTTP ${res.status}`);
  process.exit(1);
}
const json = await res.json();
const result = json.result;
if (!result) {
  console.error('no result:', JSON.stringify(json).slice(0, 300));
  process.exit(1);
}

const defs = new Map();
for (const group of result.titlelist ?? []) {
  for (const item of group.items ?? []) {
    defs.set(item.titleid, { group: group.itemtype, name: item.itemname });
  }
}

const specs = (result.datalist ?? []).map((spec) => {
  const values = {};
  for (const cell of spec.paramconflist ?? []) {
    const def = defs.get(cell.titleid);
    if (def) values[def.name] = cell.itemname;
  }
  return {
    specid: spec.specid,
    specname: spec.specname,
    minprice: spec.minprice,
    specstatus: spec.specstatus,
    values,
  };
});

if (asJson) {
  console.log(JSON.stringify({ seriesid: seriesId, year, specs }, null, 2));
  process.exit(0);
}

for (const spec of specs) {
  console.log(`\n### ${spec.specname}  (specid=${spec.specid}, 指导价=${spec.minprice}, status=${spec.specstatus})`);
  for (const [k, v] of Object.entries(spec.values)) {
    if (v === '' || v === '-' || v == null) continue;
    console.log(`${k}\t${v}`);
  }
}
