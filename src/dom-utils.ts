export function addElement(parent_element, elem, id?, cls?) {
  let newelem = document.createElement(elem);
  if (id) newelem.id = id;
  if (cls) newelem.className = cls;
  parent_element.appendChild(newelem);
  return newelem;
}

export function empty(dom) {
  while (dom.lastChild) {
    dom.removeChild(dom.lastChild);
  }
}

export function appear(dom) {
  if (!!dom) {
    let tmr = 0;
    dom.style.opacity = 0;
    dom.style.display = '';
    let a = setInterval(() => {
      tmr++;
      dom.style.opacity = tmr / 100;
      if (tmr === 100) clearInterval(a);
    }, 10);
  }
}

export function fade(dom, timer?, del?) {
  let tmr = (timer || 50);
  dom.style.opacity = 1;
  dom.style.display = '';
  let a = setInterval(() => {
    tmr--;
    dom.style.opacity = tmr / (timer || 50);
    if (tmr === 0) { clearInterval(a); if (del === true) { document.body.removeChild(dom); } }
  }, 10);
}
