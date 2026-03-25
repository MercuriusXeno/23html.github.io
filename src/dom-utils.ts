export function addElement(parent_element: HTMLElement, elem: string, id?: string | null, cls?: string): HTMLElement {
  let newelem = document.createElement(elem);
  if (id) newelem.id = id;
  if (cls) newelem.className = cls;
  parent_element.appendChild(newelem);
  return newelem;
}

export function empty(dom: HTMLElement): void {
  while (dom.lastChild) {
    dom.removeChild(dom.lastChild);
  }
}

export function appear(dom: HTMLElement): void {
  if (!!dom) {
    let tmr = 0;
    dom.style.opacity = '0';
    dom.style.display = '';
    let a = setInterval(() => {
      tmr++;
      dom.style.opacity = (tmr / 100).toString();
      if (tmr === 100) clearInterval(a);
    }, 10);
  }
}

export function draggable(root: any, target: HTMLElement) {
  root.addEventListener('mousedown', function (this: any, x: MouseEvent) { _dragState.target = target; this.boxoffsetx = x.clientX - parseInt(target.style.left); this.boxoffsety = x.clientY - parseInt(target.style.top); _dragState.root = root; document.body.addEventListener('mousemove', _draggablemove) });
  root.addEventListener('mouseup', function () { _dragState.target = null; _dragState.root = null; document.body.removeEventListener('mousemove', _draggablemove) });
}

let _dragState: { target: any; root: any } = { target: null, root: null };

function _draggablemove(x: MouseEvent) {
  if (_dragState.target) { _dragState.target.style.left = x.clientX - _dragState.root.boxoffsetx; _dragState.target.style.top = x.clientY - _dragState.root.boxoffsety }
}

export function fade(dom: HTMLElement, timer?: number, del?: boolean): void {
  let tmr = (timer || 50);
  dom.style.opacity = '1';
  dom.style.display = '';
  let a = setInterval(() => {
    tmr--;
    dom.style.opacity = (tmr / (timer || 50)).toString();
    if (tmr === 0) { clearInterval(a); if (del === true) { document.body.removeChild(dom); } }
  }, 10);
}
