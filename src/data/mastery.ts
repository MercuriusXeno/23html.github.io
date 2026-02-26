import { mastery, you, dom } from '../state';

// ==========================================================================
// Mastery constructor + instances
// ==========================================================================
function Mastery(this: any, id: any) {
  this.id = id || -1;
  this.name = 'dummy';
  this.desc = function () { return 'dummy' }
  this.condd = function () { return '????????' }
  this.icon// = [0,0];
  this.x = 20;
  this.y = 20;
  this.data = { lvl: 0 };
  this.limit = 10;
  this.have = false;
  this.linkto;
  this.linkfrom;
  this.cond = function () { return true }
  this.onlevel = function () { }
}

// @ts-ignore: constructor function
mastery.str1 = new Mastery(1);
mastery.str1.name = 'Physical Training'
mastery.str1.desc = function () { return 'Simple improvements to body physique' + dom.dseparator + '<div style="color:cyan;background-color:midnightblue;font-size:small">Effects:</div><div style="color:yellow;background-color:#123;font-size:small"><br>STR +0.5  |  HP +5  |  SAT +1<br><br></div><div style="color:cyan;background-color:midnightblue;font-size:small">Current:</div><div style="color:lime;background-color:#123;font-size:small"><br>STR +' + mastery.str1.data.lvl * .5 + '  |  HP +' + mastery.str1.data.lvl * 5 + '  |  SAT +' + mastery.str1.data.lvl + '<br><br></div>' }
mastery.str1.have = true;
mastery.str1.onlevel = function () { you.stra += .5; you.sata += 1; you.hpa += 5 }
mastery.str1.icon = [6, 3];

// @ts-ignore: constructor function
mastery.agl1 = new Mastery(2);
mastery.agl1.name = 'Athletics'
mastery.agl1.desc = function () { return '' + dom.dseparator + '<div style="color:cyan;background-color:midnightblue;font-size:small">Effects:</div><div style="color:yellow;background-color:#123;font-size:small"><br>STR +0.5  |  HP +5  |  SAT +1<br><br></div><div style="color:cyan;background-color:midnightblue;font-size:small">Current:</div><div style="color:lime;background-color:#123;font-size:small"><br>STR +' + mastery.str1.data.lvl * .5 + '  |  HP +' + mastery.str1.data.lvl * 5 + '  |  SAT +' + mastery.str1.data.lvl + '<br><br></div>' }
mastery.agl1.have = true;
mastery.agl1.x = 230;
mastery.agl1.limit = 10;
mastery.agl1.icon = [7, 3];

// @ts-ignore: constructor function
mastery.xtr1 = new Mastery(3);
mastery.xtr1.name = 'Observation';
mastery.xtr1.have = true;
mastery.xtr1.x = 430;
mastery.xtr1.limit = 10;
mastery.xtr1.icon = [1, 7];

// @ts-ignore: constructor function
mastery.fse1 = new Mastery(4);
mastery.fse1.name = 'Reflexes';
mastery.fse1.x = 230;
mastery.fse1.y = 200;
mastery.fse1.linkfrom = [mastery.str1, mastery.agl1, mastery.xtr1]
mastery.xtr1.linkto = [mastery.fse1]
mastery.fse1.icon = [6, 1];

// @ts-ignore: constructor function
mastery.hstr1 = new Mastery(9);
mastery.hstr1.have = false;
mastery.hstr1.x = 125;
mastery.hstr1.linkfrom = [mastery.str1, mastery.agl1]
mastery.hstr1.limit = 1;
mastery.hstr1.icon = [5, 3];
mastery.hstr1.hidden = true
mastery.str1.linkto = [mastery.fse1, mastery.hstr1]
mastery.agl1.linkto = [mastery.fse1, mastery.hstr1]
