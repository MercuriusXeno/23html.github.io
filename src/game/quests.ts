import { dom, you, qsts, stats } from '../state';
import { msg, msg_add } from '../ui/messages';

export function giveQst(q: any) {
  if (!q.data.started) { q.init(); q.data.started = true; msg((q.repeatable ? '<span style="color:cyan">Repeatable</span> q' : 'Q') + 'uest accepted: ' + '<span style="color:orange">"' + q.name + '"</span>', 'lightblue', q, 8); let have = false; for (let a in qsts) if (qsts[a].id === q.id) { have = true; break } if (!have) qsts.push(q); }
}

export function finishQst(q: any) {
  if (q.data.started) { q.data.done = true; q.data.started = false; q.data.pending = false; msg('Quest completed: ', 'lime'); msg_add('"' + q.name + '"', 'orange'); q.rwd(you); stats.questsCompleted++ }
}
