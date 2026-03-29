import { you, qsts, stats } from '../state';
import { emit } from '../events';

export function giveQst(q: any) {
  if (!q.data.started) { q.init(); q.data.started = true; emit('msg', (q.repeatable ? '<span style="color:cyan">Repeatable</span> q' : 'Q') + 'uest accepted: ' + '<span style="color:orange">"' + q.name + '"</span>', 'lightblue', q, 8); let have = false; for (let a in qsts) if (qsts[a].id === q.id) { have = true; break } if (!have) qsts.push(q); }
}

export function finishQst(q: any) {
  if (q.data.started) { q.data.done = true; q.data.started = false; q.data.pending = false; emit('msg', 'Quest completed: ', 'lime'); emit('msg:add', '"' + q.name + '"', 'orange'); q.rwd(you); stats.questsCompleted++ }
}
