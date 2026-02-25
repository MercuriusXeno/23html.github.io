import { w_manager, global, effect, you, skl, dom, callback, time, setTime } from '../state';
import { random, rand } from '../random';
import { findbyid, copy } from '../utils';
import { giveSkExp } from '../game/progression';
import { giveEff } from '../ui/effects';
import { msg } from '../ui/messages';

// ==========================================================================
// Weather System
// ==========================================================================

export function Weather(id) {
  this.name = '?';
  this.id = id || -1
  this.ontick = function () { };
}

export var weather: any = new Object();

weather.sunny = new Weather(100);
weather.sunny.name = 'Sunny';
weather.sunny.c = 'yellow';
weather.cloudy = new Weather(101);
weather.cloudy.name = 'Cloudy';
weather.cloudy.c = 'ghostwhite';
weather.stormy = new Weather(102);
weather.stormy.name = 'Stormy';
weather.stormy.c = '#bdbdbd';
weather.overcast = new Weather(103);
weather.overcast.name = 'Overcast';
weather.overcast.c = 'lightgrey';
weather.storm = new Weather(104);
weather.storm.name = 'Storm';
weather.storm.frain = true;
weather.storm.c = 'lightgrey';
weather.storm.bc = '#5a5a5a';
weather.thunder = new Weather(105);
weather.thunder.name = 'Thunderstorm';
weather.thunder.frain = true;
weather.thunder.c = 'yellow';
weather.thunder.bc = '#5a5a5a';
weather.rain = new Weather(106);
weather.rain.name = 'Rain';
weather.rain.c = 'cyan';
weather.rain.bc = '#2a3971';
weather.rain.frain = true;
weather.heavyrain = new Weather(107);
weather.heavyrain.name = 'Heavy rain';
weather.heavyrain.frain = true;
weather.heavyrain.c = 'cyan';
weather.heavyrain.bc = '#4d5eb3';
weather.misty = new Weather(108);
weather.misty.name = 'Misty';
weather.misty.bc = '#244b68';
weather.foggy = new Weather(109);
weather.foggy.name = 'Foggy';
weather.foggy.bc = '#7c8b9a';
weather.drizzle = new Weather(110);
weather.drizzle.name = 'Drizzle';
weather.drizzle.bc = '254863';
weather.drizzle.frain = true;
weather.clear = new Weather(111);
weather.clear.name = 'Clear';
weather.snow = new Weather(112);
weather.snow.name = 'Snow';
weather.snow.c = 'white';
weather.snow.bc = '#aaa';
weather.snow.fsnow = true;
weather.sstorm = new Weather(113);
weather.sstorm.name = 'Snow Storm';
weather.sstorm.c = 'white';
weather.sstorm.bc = '#88a';
weather.sstorm.fsnow = true;

weather.storm.ontick = weather.rain.ontick = weather.heavyrain.ontick = weather.drizzle.ontick = function () {
  if (global.flags.inside === false) {
    if (effect.wet.active === false && !you.mods.rnprtk) giveEff(you, effect.wet, 5);
    let f = findbyid(global.current_m.eff, effect.wet.id);
    if (!f || f.active === false) giveEff(global.current_m, effect.wet, 5)
  }
}

weather.thunder.ontick = function () {
  if (global.flags.inside === false) {
    if (effect.wet.active === false && !you.mods.rnprtk) giveEff(you, effect.wet, 5);
    let f = findbyid(global.current_m.eff, effect.wet.id);
    if (!f || f.active === false) giveEff(global.current_m, effect.wet, 5)
    if (random() < .0009) {
      global.stat.lgtstk++;
      msg("You were struck by lightning!", 'black', null, null, 'yellow');
      let d = (200 / (1 + skl.aba.lvl * .05)) << 0;
      if (you.hp - d < 0) { global.atkdfty[0] = 1; you.hp = 0; you.onDeath();; giveSkExp(skl.painr, 300); giveSkExp(skl.dth, 100) } else { you.hp -= d; giveSkExp(skl.painr, 170) } giveSkExp(skl.aba, 30);
      dom.d5_1_1.update();
    }
  }
}

// ==========================================================================
// Callback System
// ==========================================================================

function callbackManager(id) {
  this.id = id || 0
  this.hooks = [{ f: function (victim, killer) { }, id: 0, data: {} }]
  this.fire = function () { }
}

callback.onDeath = new callbackManager(1);
callback.onDeath.fire = function (victim, killer) {
  for (let a in this.hooks) this.hooks[a].f(victim, killer)
}

export function attachCallback(callback, what, data) {
  callback.hooks.push(what)
}

export function detachCallback(callback, what) {
  for (let a in callback.hooks) if (callback.hooks[a].id === what) callback.hooks.splice(callback.hooks[a], 1)
}

// ==========================================================================
// Time System
// ==========================================================================

export function Time() {
  this.minute = 0;
  this.hour = 0;
  this.day = 0;
  this.month = 0;
  this.year = 0;
}

setTime(new Time());
time.minute = 338144100;
global.text.d_l = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
global.text.d_s = ["Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat.", "Sun."];
global.text.d_j = ["月", "火", "水", "木", "金", "土", "日"];

// --- Time accessor functions ---
export function getMinute() { return time.minute % 60 }
export function getHour() { return time.hour % 24; }
export function getDay(n) { return n === 1 ? global.text.d_l[time.day % 7] : (n === 2 ? global.text.d_s[time.day % 7] : global.text.d_j[time.day % 7]) }
export function getMonth() { return time.month % 12 + 1; }
export function getYear() { return time.year; }
export function getLunarPhase() { return (time.day % 62.64 / 7.83) << 0 }

export function getSeason(flag?) {
  if (getMonth() > 2 && getMonth() <= 5) return !flag ? 1 : "Spring";
  else if (getMonth() > 5 && getMonth() <= 8) return !flag ? 2 : "Summer";
  else if (getMonth() > 8 && getMonth() <= 11) return !flag ? 3 : "Autumn";
  else return !flag ? 4 : "Winter";
}

export function timeConv(chrono) {
  chrono.year = (chrono.minute / (518400)) << 0;
  chrono.month = (chrono.minute / (43200)) << 0;
  chrono.day = (chrono.minute / (1440)) << 0;
  chrono.hour = (chrono.minute / 60) << 0;
}

export function timeDisp(time, future?) {
  let time_t = time;
  if (future) { time_t = copy(time); time_t.minute += future; }
  timeConv(time_t);
  let mm = time_t.minute % 60;
  if (mm < 10) mm = '0' + mm;
  return time_t.year + '/' + ((time_t.month % 12) + 1) + '/' + ((time_t.day % 30) + 1) + ' ' + time_t.hour % 24 + ':' + mm;
}

// --- Weather state machine ---

export function setWeather(w, d) {
  w_manager.curr = w;
  w_manager.duration = d;
  dom.d_weathert.style.backgroundColor = dom.d_weathert.style.color = 'inherit';
  dom.d_weathert.innerHTML = w_manager.curr.name;
  if (w.frain === true) { global.flags.israin = true; global.flags.issnow = false; dom.d_anomaly.innerHTML = '🌧' } else if (w.fsnow === true) { global.flags.issnow = true; global.flags.israin = false; dom.d_anomaly.innerHTML = '❄️' } else { global.flags.israin = false; dom.d_anomaly.innerHTML = ''; global.flags.issnow = false }
  if (w.c) dom.d_weathert.style.color = w.c;
  if (w.bc) dom.d_weathert.style.backgroundColor = w.bc;
}

export function isWeather(w) {
  return w_manager.curr.id === w.id
}

function onSeasonTick(season) {
  switch (season) {
    case 4:
      if (global.stat.wsnrest > 0) { global.stat.wsnrest--; return }
      if (!global.flags.inside) {
        if (!effect.cold.active) giveEff(you, effect.cold, 5);
        else {
          if (w_manager.curr.id === weather.snow.id || w_manager.curr.id === weather.sstorm.id) { effect.cold.duration += rand(3, 7); giveSkExp(skl.coldr, .02) } else effect.cold.duration += rand(1, 3)
          if (effect.wet.active) {
            effect.cold.duration += rand(5, 10);
            effect.wet.duration -= 5;
          }
        }
      }
      if (global.stat.wsnburst <= 0) {
        global.stat.wsnburst = rand(200, 1300)
        global.stat.wsnrest = rand(20, 100)
      }
      global.stat.wsnburst--
      break
  }
}

export function wManager() {
  let ses = getSeason()
  if (w_manager.duration > 0) w_manager.duration -= global.timescale;
  else {
    let chance = rand(1, 100);
    switch (ses) {
      case 1:
        switch (w_manager.curr.id) {
          case weather.sunny.id:
            if (chance <= 10) setWeather(weather.cloudy, rand(120, 220));
            else if (chance > 10 && chance <= 20) setWeather(weather.overcast, rand(90, 280));
            else if (chance > 20 && chance <= 90 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(300, 500));
            else if (chance > 20 && chance <= 90 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(200, 400));
            else setWeather(weather.sunny, rand(22, 44));
            break;
          case weather.cloudy.id:
            if (chance <= 15) setWeather(weather.stormy, rand(100, 200));
            else if (chance > 15 && chance <= 35) setWeather(weather.overcast, rand(90, 220));
            else if (chance > 35 && chance <= 45) setWeather(weather.rain, rand(150, 250));
            else if (chance > 45 && chance <= 65) setWeather(weather.drizzle, rand(30, 80));
            else if (chance > 65 && chance <= 80 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(300, 500));
            else if (chance > 65 && chance <= 80 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(200, 400));
            else setWeather(weather.cloudy, rand(90, 160));
            break;
          case weather.stormy.id:
            if (chance < 10) setWeather(weather.cloudy, rand(90, 120));
            else if (chance > 10 && chance <= 40) setWeather(weather.storm, rand(90, 160));
            else if (chance > 40 && chance <= 60) setWeather(weather.rain, rand(120, 200));
            else if (chance > 60 && chance <= 75) setWeather(weather.drizzle, rand(20, 40));
            else setWeather(weather.stormy, rand(60, 120));
            break;
          case weather.storm.id:
            if (chance < 5) setWeather(weather.stormy, rand(80, 120));
            else if (chance > 5 && chance <= 65) setWeather(weather.rain, rand(180, 250));
            else if (chance > 65 && chance <= 75) setWeather(weather.heavyrain, rand(80, 150));
            else setWeather(weather.storm, rand(20, 80));
            break;
          case weather.overcast.id:
            if (chance < 20) setWeather(weather.stormy, rand(50, 120));
            else if (chance > 20 && chance <= 45) setWeather(weather.cloudy, rand(100, 200));
            else if (chance > 45 && chance <= 60) setWeather(weather.clear, rand(150, 250));
            else setWeather(weather.overcast, rand(40, 90));
            break;
          case weather.rain.id:
            if (chance < 10) setWeather(weather.drizzle, rand(30, 50));
            else if (chance > 10 && chance <= 20) setWeather(weather.heavyrain, rand(100, 200));
            else if (chance > 20 && chance <= 30) setWeather(weather.overcast, rand(52, 173));
            else if (chance > 30 && chance <= 55) setWeather(weather.misty, rand(25, 55));
            else if (chance > 55 && chance <= 80) setWeather(weather.clear, rand(225, 455));
            else setWeather(weather.rain, rand(80, 120));
            break;
          case weather.heavyrain.id:
            if (chance < 10) setWeather(weather.storm, rand(80, 130));
            else if (chance > 10 && chance <= 65) setWeather(weather.rain, rand(100, 170));
            else if (chance > 65 && chance <= 75) setWeather(weather.misty, rand(15, 40));
            else if (chance > 75 && chance <= 80) setWeather(weather.clear, rand(110, 200));
            else if (chance > 80 && chance <= 90) setWeather(weather.thunder, rand(120, 200));
            else setWeather(weather.heavyrain, rand(50, 100));
            break;
          case weather.misty.id:
            if (chance < 50) setWeather(weather.foggy, rand(22, 33));
            else if (chance > 50 && chance <= 80 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
            else if (chance > 50 && chance <= 80 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
            else setWeather(weather.misty, rand(11, 22));
            break;
          case weather.foggy.id:
            if (chance < 20) setWeather(weather.overcast, rand(80, 130));
            else if (chance > 20 && chance <= 70 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
            else if (chance > 20 && chance <= 70 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
            else setWeather(weather.foggy, rand(11, 22));
            break;
          case weather.drizzle.id:
            if (chance < 20) setWeather(weather.overcast, rand(30, 60));
            else if (chance > 20 && chance <= 50) setWeather(weather.rain, rand(90, 180));
            else if (chance > 50 && chance <= 65) setWeather(weather.clear, rand(90, 180));
            else setWeather(weather.drizzle, rand(30, 62));
            break;
          case weather.clear.id:
            if (chance < 10) setWeather(weather.overcast, rand(30, 60));
            else if (chance > 10 && chance <= 55 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
            else if (chance > 10 && chance <= 55 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
            else if (chance > 55 && chance <= 65) setWeather(weather.cloudy, rand(100, 200));
            else setWeather(weather.clear, rand(160, 290));
            break;
          case weather.thunder.id:
            if (chance < 50) setWeather(weather.heavyrain, rand(60, 90));
            else if (chance > 50 && chance <= 80) setWeather(weather.storm, rand(80, 120));
            else setWeather(weather.thunder, rand(40, 60));
            break;
          default: setWeather(weather.clear, rand(30, 60));
            break;
        }
        break;
      case 2:
        switch (w_manager.curr.id) {
          case weather.sunny.id:
            if (chance <= 5) setWeather(weather.cloudy, rand(60, 120));
            else if (chance > 5 && chance <= 90 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(400, 700));
            else if (chance > 15 && chance <= 90 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(300, 500));
            else setWeather(weather.sunny, rand(90, 180));
            break;
          case weather.cloudy.id:
            if (chance <= 3) setWeather(weather.stormy, rand(30, 60));
            else if (chance > 3 && chance <= 8) setWeather(weather.overcast, rand(40, 120));
            else if (chance > 8 && chance <= 15) setWeather(weather.rain, rand(50, 100));
            else if (chance > 15 && chance <= 25) setWeather(weather.drizzle, rand(30, 80));
            else if (chance > 25 && chance <= 80 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(300, 500));
            else if (chance > 25 && chance <= 80 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(200, 400));
            else setWeather(weather.cloudy, rand(40, 120));
            break;
          case weather.stormy.id:
            if (chance < 35) setWeather(weather.cloudy, rand(60, 120));
            else if (chance > 35 && chance <= 40) setWeather(weather.storm, rand(90, 160));
            else if (chance > 40 && chance <= 60) setWeather(weather.rain, rand(70, 120));
            else if (chance > 60 && chance <= 85) setWeather(weather.drizzle, rand(60, 900));
            else setWeather(weather.stormy, rand(60, 120));
            break;
          case weather.storm.id:
            if (chance < 5) setWeather(weather.stormy, rand(30, 50));
            else if (chance > 5 && chance <= 65) setWeather(weather.rain, rand(140, 200));
            else if (chance > 65 && chance <= 70) setWeather(weather.heavyrain, rand(80, 150));
            else setWeather(weather.storm, rand(20, 80));
            break;
          case weather.overcast.id:
            if (chance < 5) setWeather(weather.stormy, rand(20, 60));
            else if (chance > 5 && chance <= 45) setWeather(weather.cloudy, rand(100, 200));
            else if (chance > 45 && chance <= 65) setWeather(weather.clear, rand(150, 250));
            else setWeather(weather.overcast, rand(60, 110));
            break;
          case weather.rain.id:
            if (chance < 10) setWeather(weather.drizzle, rand(50, 70));
            else if (chance > 10 && chance <= 15) setWeather(weather.heavyrain, rand(50, 80));
            else if (chance > 15 && chance <= 40) setWeather(weather.overcast, rand(82, 173));
            else if (chance > 40 && chance <= 55) setWeather(weather.misty, rand(25, 55));
            else if (chance > 55 && chance <= 80) setWeather(weather.clear, rand(225, 455));
            else setWeather(weather.rain, rand(80, 120));
            break;
          case weather.heavyrain.id:
            if (chance < 10) setWeather(weather.storm, rand(80, 130));
            else if (chance > 10 && chance <= 65) setWeather(weather.rain, rand(100, 170));
            else if (chance > 65 && chance <= 75) setWeather(weather.misty, rand(15, 40));
            else if (chance > 75 && chance <= 87) setWeather(weather.clear, rand(110, 200));
            else if (chance > 87 && chance <= 90) setWeather(weather.thunder, rand(120, 200));
            else setWeather(weather.heavyrain, rand(50, 100));
            break;
          case weather.misty.id:
            if (chance < 50) setWeather(weather.foggy, rand(22, 33));
            else if (chance > 50 && chance <= 80 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
            else if (chance > 50 && chance <= 80 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
            else setWeather(weather.misty, rand(11, 22));
            break;
          case weather.foggy.id:
            if (chance < 20) setWeather(weather.overcast, rand(80, 130));
            else if (chance > 20 && chance <= 70 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
            else if (chance > 20 && chance <= 70 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
            else setWeather(weather.foggy, rand(11, 22));
            break;
          case weather.drizzle.id:
            if (chance < 15) setWeather(weather.overcast, rand(30, 60));
            else if (chance > 15 && chance <= 40) setWeather(weather.cloudy, rand(90, 180));
            else if (chance > 40 && chance <= 50) setWeather(weather.rain, rand(50, 111));
            else if (chance > 50 && chance <= 65) setWeather(weather.clear, rand(90, 180));
            else setWeather(weather.drizzle, rand(30, 62));
            break;
          case weather.clear.id:
            if (chance < 5) setWeather(weather.overcast, rand(30, 60));
            else if (chance > 5 && chance <= 55 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
            else if (chance > 10 && chance <= 55 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
            else if (chance > 55 && chance <= 65) setWeather(weather.cloudy, rand(100, 200));
            else setWeather(weather.clear, rand(160, 290));
            break;
          case weather.thunder.id:
            if (chance < 50) setWeather(weather.heavyrain, rand(60, 90));
            else if (chance > 50 && chance <= 80) setWeather(weather.storm, rand(80, 120));
            else setWeather(weather.thunder, rand(40, 60));
            break;
          default: setWeather(weather.clear, rand(30, 60));
            break;
        }
        break;
      case 3:
        switch (w_manager.curr.id) {
          case weather.sunny.id:
            if (chance <= 25) setWeather(weather.cloudy, rand(120, 220));
            else if (chance > 25 && chance <= 60) setWeather(weather.overcast, rand(90, 280));
            else if (chance > 60 && chance <= 90 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(80, 150));
            else if (chance > 60 && chance <= 90 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(120, 180));
            else setWeather(weather.sunny, rand(22, 44));
            break;
          case weather.cloudy.id:
            if (chance <= 30) setWeather(weather.stormy, rand(100, 200));
            else if (chance > 30 && chance <= 55) setWeather(weather.overcast, rand(90, 220));
            else if (chance > 55 && chance <= 85) setWeather(weather.rain, rand(150, 250));
            else if (chance > 85 && chance <= 90) setWeather(weather.drizzle, rand(70, 120));
            else if (chance > 90 && chance <= 95 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(170, 250));
            else if (chance > 90 && chance <= 95 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(180, 300));
            else setWeather(weather.cloudy, rand(90, 160));
            break;
          case weather.stormy.id:
            if (chance < 15) setWeather(weather.cloudy, rand(90, 120));
            else if (chance > 15 && chance <= 40) setWeather(weather.storm, rand(90, 160));
            else if (chance > 40 && chance <= 70) setWeather(weather.rain, rand(120, 200));
            else if (chance > 70 && chance <= 85) setWeather(weather.drizzle, rand(20, 40));
            else setWeather(weather.stormy, rand(60, 120));
            break;
          case weather.storm.id:
            if (chance < 10) setWeather(weather.stormy, rand(80, 120));
            else if (chance > 10 && chance <= 45) setWeather(weather.rain, rand(180, 250));
            else if (chance > 45 && chance <= 85) setWeather(weather.heavyrain, rand(100, 190));
            else setWeather(weather.storm, rand(20, 80));
            break;
          case weather.overcast.id:
            if (chance < 20) setWeather(weather.stormy, rand(50, 120));
            else if (chance > 20 && chance <= 55) setWeather(weather.cloudy, rand(80, 150));
            else if (chance > 55 && chance <= 60) setWeather(weather.clear, rand(150, 250));
            else setWeather(weather.overcast, rand(40, 90));
            break;
          case weather.rain.id:
            if (chance < 10) setWeather(weather.drizzle, rand(30, 50));
            else if (chance > 10 && chance <= 30) setWeather(weather.heavyrain, rand(100, 200));
            else if (chance > 30 && chance <= 40) setWeather(weather.overcast, rand(52, 173));
            else if (chance > 40 && chance <= 50) setWeather(weather.misty, rand(25, 55));
            else if (chance > 50 && chance <= 65) setWeather(weather.clear, rand(100, 200));
            else setWeather(weather.rain, rand(80, 120));
            break;
          case weather.heavyrain.id:
            if (chance < 15) setWeather(weather.storm, rand(80, 130));
            else if (chance > 15 && chance <= 55) setWeather(weather.rain, rand(100, 170));
            else if (chance > 55 && chance <= 65) setWeather(weather.misty, rand(15, 40));
            else if (chance > 65 && chance <= 70) setWeather(weather.clear, rand(110, 200));
            else if (chance > 70 && chance <= 95) setWeather(weather.thunder, rand(120, 200));
            else setWeather(weather.heavyrain, rand(50, 100));
            break;
          case weather.misty.id:
            if (chance < 25) setWeather(weather.foggy, rand(22, 33));
            else if (chance > 25 && chance <= 55) setWeather(weather.overcast, rand(60, 100));
            else if (chance > 55 && chance <= 75) setWeather(weather.cloudy, rand(60, 100));
            else setWeather(weather.misty, rand(11, 22));
            break;
          case weather.foggy.id:
            if (chance < 20) setWeather(weather.overcast, rand(80, 130));
            else if (chance > 20 && chance <= 40) setWeather(weather.rain, rand(100, 200));
            else if (chance > 40 && chance <= 70) setWeather(weather.heavyrain, rand(100, 200));
            else setWeather(weather.foggy, rand(11, 22));
            break;
          case weather.drizzle.id:
            if (chance < 15) setWeather(weather.overcast, rand(30, 60));
            else if (chance > 15 && chance <= 55) setWeather(weather.rain, rand(90, 180));
            else if (chance > 55 && chance <= 60) setWeather(weather.clear, rand(60, 100));
            else if (chance > 60 && chance <= 70) setWeather(weather.cloudy, rand(40, 90));
            else setWeather(weather.drizzle, rand(30, 62));
            break;
          case weather.clear.id:
            if (chance < 25) setWeather(weather.overcast, rand(80, 140));
            else if (chance > 25 && chance <= 45 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
            else if (chance > 25 && chance <= 45 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
            else if (chance > 45 && chance <= 70) setWeather(weather.cloudy, rand(100, 200));
            else if (chance > 70 && chance <= 90) setWeather(weather.drizzle, rand(30, 80));
            else setWeather(weather.clear, rand(120, 200));
            break;
          case weather.thunder.id:
            if (chance < 30) setWeather(weather.heavyrain, rand(60, 90));
            else if (chance > 30 && chance <= 60) setWeather(weather.storm, rand(80, 120));
            else setWeather(weather.thunder, rand(40, 60));
            break;
          default: setWeather(weather.clear, rand(30, 60));
            break;
        }
        break;
      case 4:
        switch (w_manager.curr.id) {
          case weather.sunny.id:
            if (chance <= 40) setWeather(weather.cloudy, rand(120, 220));
            else if (chance > 40 && chance <= 80) setWeather(weather.overcast, rand(90, 280));
            else if (chance > 80 && chance <= 90 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 300));
            else if (chance > 80 && chance <= 90 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 300));
            else setWeather(weather.sunny, rand(22, 44));
            break;
          case weather.cloudy.id:
            if (chance <= 15) setWeather(weather.overcast, rand(90, 220));
            else if (chance > 15 && chance <= 17) setWeather(weather.rain, rand(30, 80));
            else if (chance > 17 && chance <= 20) setWeather(weather.drizzle, rand(30, 80));
            else if (chance > 20 && chance <= 30 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 300));
            else if (chance > 20 && chance <= 30 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 300));
            else if (chance > 30 && chance <= 60) setWeather(weather.snow, rand(180, 300));
            else if (chance > 60 && chance <= 70) setWeather(weather.sstorm, rand(90, 200));
            else setWeather(weather.cloudy, rand(90, 160));
            break;
          case weather.overcast.id:
            if (chance < 20) setWeather(weather.snow, rand(50, 120));
            else if (chance > 20 && chance <= 45) setWeather(weather.cloudy, rand(100, 200));
            else if (chance > 45 && chance <= 60) setWeather(weather.clear, rand(150, 250));
            else if (chance > 60 && chance <= 70) setWeather(weather.sstorm, rand(150, 250));
            else setWeather(weather.overcast, rand(40, 90));
            break;
          case weather.rain.id:
            if (chance < 10) setWeather(weather.drizzle, rand(30, 50));
            else if (chance > 10 && chance <= 20) setWeather(weather.snow, rand(100, 200));
            else if (chance > 20 && chance <= 30) setWeather(weather.overcast, rand(52, 173));
            else if (chance > 30 && chance <= 55) setWeather(weather.misty, rand(25, 55));
            else if (chance > 55 && chance <= 80) setWeather(weather.clear, rand(225, 455));
            else setWeather(weather.rain, rand(20, 40));
            break;
          case weather.misty.id:
            if (chance < 30) setWeather(weather.foggy, rand(22, 33));
            else if (chance > 30 && chance <= 50) setWeather(weather.snow, rand(100, 200));
            else if (chance > 50 && chance <= 80 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
            else if (chance > 50 && chance <= 80 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
            else setWeather(weather.misty, rand(11, 22));
            break;
          case weather.foggy.id:
            if (chance < 20) setWeather(weather.overcast, rand(80, 130));
            else if (chance > 20 && chance <= 70 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
            else if (chance > 20 && chance <= 70 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
            else setWeather(weather.foggy, rand(11, 22));
            break;
          case weather.drizzle.id:
            if (chance < 20) setWeather(weather.overcast, rand(30, 60));
            else if (chance > 20 && chance <= 25) setWeather(weather.rain, rand(90, 120));
            else if (chance > 25 && chance <= 40) setWeather(weather.snow, rand(90, 180));
            else if (chance > 40 && chance <= 65) setWeather(weather.clear, rand(90, 150));
            else setWeather(weather.drizzle, rand(30, 62));
            break;
          case weather.clear.id:
            if (chance < 10) setWeather(weather.overcast, rand(30, 60));
            else if (chance > 10 && chance <= 55 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
            else if (chance > 10 && chance <= 55 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
            else if (chance > 55 && chance <= 65) setWeather(weather.cloudy, rand(100, 200));
            else if (chance > 65 && chance <= 75) setWeather(weather.snow, rand(100, 200));
            else setWeather(weather.clear, rand(160, 290));
            break;
          case weather.snow.id:
            if (chance < 20) setWeather(weather.sstorm, rand(80, 130));
            else if (chance > 20 && chance <= 25) setWeather(weather.rain, rand(15, 50));
            else if (chance > 25 && chance <= 40) setWeather(weather.clear, rand(90, 150));
            else if (chance > 40 && chance <= 65) setWeather(weather.overcast, rand(140, 320));
            else if (chance > 60 && chance <= 85) setWeather(weather.cloudy, rand(120, 200));
            else setWeather(weather.snow, rand(30, 62));
            break;
          case weather.sstorm.id:
            if (chance < 10) setWeather(weather.overcast, rand(30, 60));
            else if (chance > 10 && chance <= 35) setWeather(weather.snow, rand(90, 120));
            else if (chance > 35 && chance <= 45) setWeather(weather.cloudy, rand(90, 180));
            else if (chance > 45 && chance <= 65) setWeather(weather.overcast, rand(90, 150));
            else setWeather(weather.sstorm, rand(40, 120));
            break;
          default: setWeather(weather.clear, rand(30, 60));
            break;
        }
        break;
    }
    dom.d_weathert.style.backgroundColor = dom.d_weathert.style.color = 'inherit';
    dom.d_weathert.innerHTML = w_manager.curr.name
    dom.d_weathert.style.color = w_manager.curr.c ? w_manager.curr.c : 'inherit';
    dom.d_weathert.style.backgroundColor = w_manager.curr.bc ? w_manager.curr.bc : 'inherit';
    switch (w_manager.curr.id) {
      case weather.sunny.id:
        if ((getHour() > 4 && getMinute() >= 30) && getHour() <= 6) { dom.d_weathert.innerHTML = 'Sunrise'; dom.d_weathert.style.color = '#ffef33'; dom.d_weathert.style.backgroundColor = '#bf495f' }
        else if (getHour() >= 20 && getHour() <= 21) { dom.d_weathert.innerHTML = 'Dusk'; dom.d_weathert.style.color = 'yellow'; dom.d_weathert.style.backgroundColor = '#e8421c' }
        else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Bright Night'; dom.d_weathert.style.color = 'cornflowerblue'; dom.d_weathert.style.backgroundColor = '#1d4677' }
        break;
      case weather.cloudy.id:
        if ((getHour() > 4 && getMinute() >= 30) && getHour() <= 6) { dom.d_weathert.innerHTML = 'Sunrise'; dom.d_weathert.style.color = '#ffef33'; dom.d_weathert.style.backgroundColor = '#bf495f' }
        else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Night'; dom.d_weathert.style.color = '#69e1e6'; dom.d_weathert.style.backgroundColor = '#091523' }
        break;
      case weather.overcast.id:
        if (getHour() >= 18 && getHour() <= 21) { dom.d_weathert.innerHTML = 'Dusk'; dom.d_weathert.style.color = 'yellow'; dom.d_weathert.style.backgroundColor = '#e8421c' }
        else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Night'; dom.d_weathert.style.color = '#69e1e6'; dom.d_weathert.style.backgroundColor = '#091523' }
        break;
      case weather.rain.id:
        if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Rainy Night'; dom.d_weathert.style.color = 'cyan'; dom.d_weathert.style.backgroundColor = '#111f63' }
        break;
      case weather.misty.id:
        if ((getHour() > 4 && getMinute() >= 30) && getHour() <= 6) { dom.d_weathert.innerHTML = 'Misty Morning'; dom.d_weathert.style.color = '#ffb91d'; dom.d_weathert.style.backgroundColor = '#926b64' }
        else if (getHour() >= 18 && getHour() <= 21) { dom.d_weathert.innerHTML = 'Dusk'; dom.d_weathert.style.color = 'yellow'; dom.d_weathert.style.backgroundColor = '#e8421c' }
        else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Misty Night'; dom.d_weathert.style.color = '#1f69a9'; dom.d_weathert.style.backgroundColor = '#2c3044' }
        break;
      case weather.foggy.id:
        if ((getHour() > 4 && getMinute() >= 30) && getHour() <= 6) { dom.d_weathert.innerHTML = 'Foggy Morning'; dom.d_weathert.style.color = '#ffc94f'; dom.d_weathert.style.backgroundColor = '#8e8280' }
        else if (getHour() >= 18 && getHour() <= 21) { dom.d_weathert.innerHTML = 'Dusk'; dom.d_weathert.style.color = 'yellow'; dom.d_weathert.style.backgroundColor = '#e8421c' }
        else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Foggy Night'; dom.d_weathert.style.color = '#6dbbff'; dom.d_weathert.style.backgroundColor = '#273267' }
        break;
      case weather.drizzle.id:
        if (getHour() >= 22 && getHour() <= 3) { dom.d_weathert.innerHTML = 'Night Drizzle'; dom.d_weathert.style.color = 'cyan'; dom.d_weathert.style.backgroundColor = '#111f63' }
        break;
      case weather.clear.id:
        if ((getHour() > 4 && getMinute() >= 30) && getHour() <= 6) { dom.d_weathert.innerHTML = 'Sunrise'; dom.d_weathert.style.color = '#ffef33'; dom.d_weathert.style.backgroundColor = '#9c3f3f' }
        else if (getHour() >= 20 && getHour() <= 21) { dom.d_weathert.innerHTML = 'Dusk'; dom.d_weathert.style.color = 'yellow'; dom.d_weathert.style.backgroundColor = '#e8421c' }
        else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Starry Night'; dom.d_weathert.style.color = '#ffff66'; dom.d_weathert.style.backgroundColor = '#00397b' }
        break;
    }
  } w_manager.curr.ontick(); onSeasonTick(ses);
}

// NOTE: Eval-time init (setWeather, wManager, dom.d_time update) moved to main.ts
// because DOM elements (d_weathert, d_anomaly, d_time) must exist first.
