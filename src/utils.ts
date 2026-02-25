import { rand } from './random';

export function select(arr: any[]): any {
  return arr[rand(arr.length - 1)];
}

export function shuffle(arr: any[]): void {
  let copy: any[] = [];
  let index = 0;
  for (let a in arr) copy[a] = arr[a];
  while (copy.length != 0) { let val = rand(copy.length - 1); arr[index++] = copy[val]; copy.splice(val, 1) }
}

export function deepCopy(o: any): any {
  let copy = o, k;
  if (o && typeof o === 'object') {
    copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
    for (let k in o) {
      copy[k] = deepCopy(o[k]);
    }
  }
  return copy;
}

export function copy(o: any): any {
  let res: any = new Object();
  for (let a in o) res[a] = o[a];
  return res;
}

export function objempty(obj: any): boolean | undefined { for (let a in obj) return false }

export function format3(a: string): string {
  if (a.length > 3) {
    let b = new String();
    for (let i = 0; i < a.length; i++) { if ((a.length - i) % 3 == 0 && i > (Number(a) > 0 ? 0 : 1)) b += ','; b += a[i] }
    return b.toString();
  } return a;
}

export function col(txt: string, c?: string, bc?: string): string {
  let cc;
  let bcc;
  if (c) cc = 'color:' + c + ';';
  if (bc) bcc = 'background-color:' + bc + ';';
  return '<span' + (c ? (' style="' + cc + (bc ? bcc : '') + '"') : '') + '>' + txt + '</span>'
}

export function scan(arr: any[], val: any, am?: number): boolean | undefined {
  if (am) { for (let obj in arr) if (arr[obj].id === val.id && arr[obj].amount >= am) return true }
  else for (let obj in arr) if (arr[obj] === val) return true;
}

export function scanbyid(arr: any[], val: string): boolean | undefined { for (let obj in arr) if (arr[obj].id === val) return true }
export function scanbyuid(arr: any[], val: any): boolean | undefined { for (let obj in arr) if (arr[obj].data.uid === val) return true }
export function find(arr: any[], val: any): any { for (let obj in arr) if (arr[obj] === val) return arr[obj] }
export function findbyid(arr: any[], val: string): any { for (let obj in arr) if (arr[obj].id === val) return arr[obj] }
export function findbest(arr: any[], itm: any): any[] {
  let temp: any[] = [];
  for (let a in arr) if (arr[a].id === itm.id) temp.push(arr[a]);
  return temp.sort(function (a: any, b: any) { if (a.dp > b.dp) return -1; return 1 })
}
export function findworst(arr: any[], itm: any): any[] {
  let temp: any[] = [];
  for (let a in arr) if (arr[a].id === itm.id) temp.push(arr[a]);
  return temp.sort(function (a: any, b: any) { if (a.dp < b.dp) return -1; return 1 })
}

export function z_bake(area: any): void {
  let c = 0;
  let d = 0;
  let b: number[] = [];
  let e: number[][] = [];
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
