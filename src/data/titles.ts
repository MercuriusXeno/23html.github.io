import { ttl, act } from '../state'
import titleData from './titles.json'
// ==========================================================================
// Title constructor + instances
// ==========================================================================

class Title {
  constructor(
    public id: number,
    public name: string = '',
    public desc: string = '',
    public tdesc: string = '',
    public have = false,
    public tget = false,
    public rar = 1,
    public rars = false
  ) { }
  onGet(_player: any) { }
}

function init_collection(data: any) {
  for (let spec of data) {
    const { id, abbr, name, desc, tdesc, rar, rars } = spec;
    ttl[abbr] = new Title(id, name, desc, tdesc, rar, rars)
  }
}

function add_custom_logic() {
  ttl.wlk.talent = function (player: any) { player.mods.runerg -= .05 }
  ttl.jgg.talent = function (player: any) { player.mods.runerg -= .15 }
  ttl.rfpn2.talent = function (player: any) { player.mods.survinf++ }
  ttl.tqtm.talent = function () {/*(:*/ }
  ttl.wlk.onGet = function (player: any) { if (act.demo.active) player.mods.sdrate -= .005 }
  ttl.jgg.onGet = function (player: any) { if (act.demo.active) player.mods.sdrate -= .015 }
}

init_collection(titleData)
add_custom_logic()