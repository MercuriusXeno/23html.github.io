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

function init_title_collection(title_data: any) {
  for (let title_spec of title_data) {
    const { id, abbr, name, desc, tdesc, rar, rars } = title_spec;
    ttl[abbr] = new Title(id, name, desc, tdesc, rar, rars)
  }
}

function add_title_custom_logic() {
  ttl.wlk.talent = function (player: any) { player.mods.runerg -= .05 }
  ttl.jgg.talent = function (player: any) { player.mods.runerg -= .15 }
  ttl.rfpn2.talent = function (player: any) { player.mods.survinf++ }
  ttl.tqtm.talent = function () {/*(:*/ }
  ttl.wlk.onGet = function (player: any) { if (act.demo.active) player.mods.sdrate -= .005 }
  ttl.jgg.onGet = function (player: any) { if (act.demo.active) player.mods.sdrate -= .015 }
}

init_title_collection(titleData)
add_title_custom_logic()