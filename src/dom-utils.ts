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
