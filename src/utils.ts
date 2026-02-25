import { rand } from './random';

export function select(arr) {
  return arr[rand(arr.length - 1)];
}

export function shuffle(arr) {
  let copy = [];
  let index = 0;
  for (let a in arr) copy[a] = arr[a];
  while (copy.length != 0) { let val = rand(copy.length - 1); arr[index++] = copy[val]; copy.splice(val, 1) }
}

export function deepCopy(o) {
  let copy = o, k;
  if (o && typeof o === 'object') {
    copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
    for (let k in o) {
      copy[k] = deepCopy(o[k]);
    }
  }
  return copy;
}

export function copy(o) {
  let res = new Object();
  for (let a in o) res[a] = o[a];
  return res;
}

export function objempty(obj) { for (let a in obj) return false }

export function format3(a) {
  if (a.length > 3) {
    let b = new String();
    for (let i = 0; i < a.length; i++) { if ((a.length - i) % 3 == 0 && i > (a > 0 ? 0 : 1)) b += ','; b += a[i] }
    return b;
  } return a;
}

export function col(txt, c, bc) {
  let cc;
  let bcc;
  if (c) cc = 'color:' + c + ';';
  if (bc) bcc = 'background-color:' + bc + ';';
  return '<span' + (c ? (' style="' + cc + (bc ? bcc : '') + '"') : '') + '>' + txt + '</span>'
}

export function scan(arr, val, am?) {
  if (am) { for (let obj in arr) if (arr[obj].id === val.id && arr[obj].amount >= am) return true }
  else for (let obj in arr) if (arr[obj] === val) return true;
}

export function scanbyid(arr, val) { for (let obj in arr) if (arr[obj].id === val) return true }
export function scanbyuid(arr, val) { for (let obj in arr) if (arr[obj].data.uid === val) return true }
export function find(arr, val) { for (let obj in arr) if (arr[obj] === val) return arr[obj] }
export function findbyid(arr, val) { for (let obj in arr) if (arr[obj].id === val) return arr[obj] }
export function findbest(arr, itm) {
  let temp = [];
  for (let a in arr) if (arr[a].id === itm.id) temp.push(arr[a]);
  return temp.sort(function (a, b) { if (a.dp > b.dp) return -1; return 1 })
}
export function findworst(arr, itm) {
  let temp = [];
  for (let a in arr) if (arr[a].id === itm.id) temp.push(arr[a]);
  return temp.sort(function (a, b) { if (a.dp < b.dp) return -1; return 1 })
}

export function z_bake(area) {
  let c = 0;
  let d = 0;
  let b = [];
  let e = [];
  let s = 0;
  for (let i = 0; i < area.pop.length; i++) c += area.pop[i].c;
  d = 1 - c;
  for (let i = 0; i < area.pop.length; i++) b[i] = (d / c) * area.pop[i].c + area.pop[i].c;
  for (let i = 0; i < b.length; i++) {
    if (i === 0) { e[i] = [0, b[i]]; s = b[i]; }
    else if (i === b.length - 1) e[i] = [s, 1];
    else { e[i] = [s, b[i] + s]; s += b[i] }
  } area.popc = e;
}
