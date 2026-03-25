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

export function deepCopy(obj: any): any {
  let copy = obj, k;
  if (obj && typeof obj === 'object') {
    copy = Object.prototype.toString.call(obj) === '[object Array]' ? [] : {};
    for (let k in obj) {
      copy[k] = deepCopy(obj[k]);
    }
  }
  return copy;
}

export function copy(obj: any): any {
  let res: any = new Object();
  for (let a in obj) res[a] = obj[a];
  return res;
}

export function objempty(obj: any): boolean | undefined { for (let a in obj) return false }

export function format3(str: string): string {
  if (str.length > 3) {
    let b = new String();
    for (let i = 0; i < str.length; i++) { if ((str.length - i) % 3 == 0 && i > (Number(str) > 0 ? 0 : 1)) b += ','; b += str[i] }
    return b.toString();
  } return str;
}

export function col(txt: any, color?: string, bgColor?: string): string {
  let cc;
  let bcc;
  if (color) cc = 'color:' + color + ';';
  if (bgColor) bcc = 'background-color:' + bgColor + ';';
  return '<span' + (color ? (' style="' + cc + (bgColor ? bcc : '') + '"') : '') + '>' + txt + '</span>'
}

export function scan(arr: any[], val: any, amount?: number): boolean | undefined {
  if (amount) { for (let obj in arr) if (arr[obj].id === val.id && arr[obj].amount >= amount) return true }
  else for (let obj in arr) if (arr[obj] === val) return true;
}

export function scanbyid(arr: any[], val: string | number | undefined): boolean | undefined { for (let obj in arr) if (arr[obj].id === val) return true }
export function scanbyuid(arr: any[], val: any): boolean | undefined { for (let obj in arr) if (arr[obj].data.uid === val) return true }
export function find(arr: any[], val: any): any { for (let obj in arr) if (arr[obj] === val) return arr[obj] }
export function findbyid(arr: any[], val: string | number): any { for (let obj in arr) if (arr[obj].id === val) return arr[obj] }
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
