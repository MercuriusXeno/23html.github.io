import { Chs } from '../ui/choices';
import { chs, choiceNav } from '../ui/choices';
import { addtosector, d_loc } from '../game/movement';
import { global, chss, gameText, sector } from '../state';
import { select } from '../utils';

export function initCatacombsLocations() {
    gameText.catasound = ['You are hearing weird sounds', 'Crunching sound echoes', 'Your feet sink into the muddy ground', 'You hear wailing',
      'Something growls in the distance', 'Damp stagnant air of the underground makes it difficult to breathe', 'You hear bones', 'You notice something move in the darkness',
      'You feel sinister aura', 'Aged walls have something written on them, but you are unable to decipher what it is', 'Bone bits are littered on the ground', 'Old rotting cloth is hanging from the walls', 'Something rusty sparkes from below', 'old stale air fills your lungs'];

// @ts-ignore: constructor function
    chss.catamn = new Chs();
    chss.catamn.id = 132;
    addtosector(sector.cata1, chss.catamn);
    chss.catamn.sl = () => {
      d_loc('Catacombs, The Entryway'); global.lst_loc = 132;
      chs('"You have entered the Catacombs"', true, 'lightgrey', 'black')
      choiceNav('"↑ Move North"', chss.cata1);
      choiceNav('"<= Exit"', chss.lsmain1);
    }

// @ts-ignore: constructor function
    chss.cata1 = new Chs();
    chss.cata1.id = 133;
    addtosector(sector.cata1, chss.cata1)
    chss.cata1.sl = () => {
      d_loc('Catacombs, The Casket Service'); global.lst_loc = 133;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"← Move West"', chss.cata13);
      choiceNav('"→ Move East"', chss.cata2);
      choiceNav('"↓ Move South"', chss.catamn);
    }

// @ts-ignore: constructor function
    chss.cata2 = new Chs();
    chss.cata2.id = 134;
    addtosector(sector.cata1, chss.cata2)
    chss.cata2.sl = () => {
      d_loc('Catacombs, The Mourning Hall'); global.lst_loc = 134;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"← Move West"', chss.cata1);
      choiceNav('"→ Move East"', chss.cata3);
    }

// @ts-ignore: constructor function
    chss.cata3 = new Chs();
    chss.cata3.id = 135;
    addtosector(sector.cata1, chss.cata3)
    chss.cata3.sl = () => {
      d_loc('Catacombs, The Last Breath'); global.lst_loc = 135;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata4);
      choiceNav('"← Move West"', chss.cata2);
    }

// @ts-ignore: constructor function
    chss.cata4 = new Chs();
    chss.cata4.id = 136;
    addtosector(sector.cata1, chss.cata4)
    chss.cata4.sl = () => {
      d_loc('Catacombs, Tunnel of the Dead'); global.lst_loc = 136;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata5);
      choiceNav('"↓ Move South"', chss.cata3);
    }

// @ts-ignore: constructor function
    chss.cata5 = new Chs();
    chss.cata5.id = 137;
    addtosector(sector.cata1, chss.cata5)
    chss.cata5.sl = () => {
      d_loc('Catacombs, Movement Below'); global.lst_loc = 137;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata6, false);
      choiceNav('"← Move West"', chss.cata12);
      choiceNav('"↓ Move South"', chss.cata4);
    }

// @ts-ignore: constructor function
    chss.cata6 = new Chs();
    chss.cata6.id = 138;
    addtosector(sector.cata1, chss.cata6)
    chss.cata6.sl = () => {
      d_loc('Catacombs, The Web Corridor'); global.lst_loc = 138;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata7);
      choiceNav('"↓ Move South"', chss.cata5);
    }

// @ts-ignore: constructor function
    chss.cata7 = new Chs();
    chss.cata7.id = 139;
    addtosector(sector.cata1, chss.cata7)
    chss.cata7.sl = () => {
      d_loc('Catacombs, Grievance'); global.lst_loc = 139;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"← Move West"', chss.cata8);
      choiceNav('"↓ Move South"', chss.cata6);
    }

// @ts-ignore: constructor function
    chss.cata8 = new Chs();
    chss.cata8.id = 140;
    addtosector(sector.cata1, chss.cata8)
    chss.cata8.sl = () => {
      d_loc('Catacombs, Forgotten Post'); global.lst_loc = 140;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"← Move West"', chss.cata9);
      choiceNav('"→ Move East"', chss.cata7);
    }

// @ts-ignore: constructor function
    chss.cata9 = new Chs();
    chss.cata9.id = 141;
    addtosector(sector.cata1, chss.cata9)
    chss.cata9.sl = () => {
      d_loc('Catacombs, Withered Hand'); global.lst_loc = 141;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"→ Move East"', chss.cata8);
      choiceNav('"↓ Move South"', chss.cata10);
    }

// @ts-ignore: constructor function
    chss.cata10 = new Chs();
    chss.cata10.id = 142;
    addtosector(sector.cata1, chss.cata10)
    chss.cata10.sl = () => {
      d_loc('Catacombs, The Rusted Arc'); global.lst_loc = 142;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata9);
      choiceNav('"↓ Move South"', chss.cata11);
    }

// @ts-ignore: constructor function
    chss.cata11 = new Chs();
    chss.cata11.id = 143;
    addtosector(sector.cata1, chss.cata11)
    chss.cata11.sl = () => {
      d_loc('Catacombs, Old One\'s Destination'); global.lst_loc = 143;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata10);
      choiceNav('"→ Move East"', chss.cata12);
    }

// @ts-ignore: constructor function
    chss.cata12 = new Chs();
    chss.cata12.id = 144;
    addtosector(sector.cata1, chss.cata12)
    chss.cata12.sl = () => {
      d_loc('Catacombs, Thawing Candles'); global.lst_loc = 144;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"← Move West"', chss.cata11);
      choiceNav('"→ Move East"', chss.cata5);
    }

// @ts-ignore: constructor function
    chss.cata13 = new Chs();
    chss.cata13.id = 145;
    addtosector(sector.cata1, chss.cata13)
    chss.cata13.sl = () => {
      d_loc('Catacombs, The Endless Echoes'); global.lst_loc = 145;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"← Move West"', chss.cata14);
      choiceNav('"→ Move East"', chss.cata1);
    }

// @ts-ignore: constructor function
    chss.cata14 = new Chs();
    chss.cata14.id = 146;
    addtosector(sector.cata1, chss.cata14)
    chss.cata14.sl = () => {
      d_loc('Catacombs, The Dusty Underpass'); global.lst_loc = 146;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata15);
      choiceNav('"→ Move East"', chss.cata13);
    }

// @ts-ignore: constructor function
    chss.cata15 = new Chs();
    chss.cata15.id = 147;
    addtosector(sector.cata1, chss.cata15)
    chss.cata15.sl = () => {
      d_loc('Catacombs, Light\'s Corner'); global.lst_loc = 147;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata16);
      choiceNav('"↓ Move South"', chss.cata14);
    }

// @ts-ignore: constructor function
    chss.cata16 = new Chs();
    chss.cata16.id = 148;
    addtosector(sector.cata1, chss.cata16)
    chss.cata16.sl = () => {
      d_loc('Catacombs, Son\'s Last Visit'); global.lst_loc = 148;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata17);
      choiceNav('"↓ Move South"', chss.cata15);
    }

// @ts-ignore: constructor function
    chss.cata17 = new Chs();
    chss.cata17.id = 149;
    addtosector(sector.cata1, chss.cata17)
    chss.cata17.sl = () => {
      d_loc('Catacombs, The Stone Plate'); global.lst_loc = 149;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata18);
      choiceNav('"↓ Move South"', chss.cata16);
    }

// @ts-ignore: constructor function
    chss.cata18 = new Chs();
    chss.cata18.id = 150;
    addtosector(sector.cata1, chss.cata18)
    chss.cata18.sl = () => {
      d_loc('Catacombs, Cracked Passageway'); global.lst_loc = 150;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"← Move West"', chss.cata19);
      choiceNav('"↓ Move South"', chss.cata17);
    }

// @ts-ignore: constructor function
    chss.cata19 = new Chs();
    chss.cata19.id = 151;
    addtosector(sector.cata1, chss.cata19)
    chss.cata19.sl = () => {
      d_loc('Catacombs, The Limited Leeway'); global.lst_loc = 151;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"← Move West"', chss.cata20);
      choiceNav('"→ Move East"', chss.cata18);
    }

// @ts-ignore: constructor function
    chss.cata20 = new Chs();
    chss.cata20.id = 152;
    addtosector(sector.cata1, chss.cata20)
    chss.cata20.sl = () => {
      d_loc('Catacombs, The Brittle Turn'); global.lst_loc = 152;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"→ Move East"', chss.cata19);
      choiceNav('"↓ Move South"', chss.cata21);
    }

// @ts-ignore: constructor function
    chss.cata21 = new Chs();
    chss.cata21.id = 153;
    addtosector(sector.cata1, chss.cata21)
    chss.cata21.sl = () => {
      d_loc('Catacombs, Bright Ray Above'); global.lst_loc = 153;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata20);
      choiceNav('"↓ Move South"', chss.cata22);
    }

// @ts-ignore: constructor function
    chss.cata22 = new Chs();
    chss.cata22.id = 154;
    addtosector(sector.cata1, chss.cata22)
    chss.cata22.sl = () => {
      d_loc('Catacombs, Nowhere To Run'); global.lst_loc = 154;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata21);
      choiceNav('"↓ Move South"', chss.cata23);
    }

// @ts-ignore: constructor function
    chss.cata23 = new Chs();
    chss.cata23.id = 155;
    addtosector(sector.cata1, chss.cata23)
    chss.cata23.sl = () => {
      d_loc('Catacombs, The Aging Room'); global.lst_loc = 155;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata22);
      choiceNav('"↓ Move South"', chss.cata24);
    }

// @ts-ignore: constructor function
    chss.cata24 = new Chs();
    chss.cata24.id = 156;
    addtosector(sector.cata1, chss.cata24)
    chss.cata24.sl = () => {
      d_loc('Catacombs, Eleven Wisemen'); global.lst_loc = 156;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"↑ Move North"', chss.cata23);
      choiceNav('"← Move West"', chss.cata25);
    }

// @ts-ignore: constructor function
    chss.cata25 = new Chs();
    chss.cata25.id = 157;
    addtosector(sector.cata1, chss.cata25)
    chss.cata25.sl = () => {
      d_loc('Catacombs, The End Of Journey'); global.lst_loc = 157;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      choiceNav('"→ Move East"', chss.cata24);
    }
}
