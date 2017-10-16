import './style.scss';
import 'expose-loader?ROT!rot-js';
import * as PIXI from 'pixi.js';


// const ROT = (window as any).ROT;

// console.log(ROT);
// const display = new ROT.Display({ width: 100, height: 100 });

// const canvas = display.getContainer();
// console.dir(canvas);
// const transform = `scale(${1 / window.devicePixelRatio}) translate(-${100 / window.devicePixelRatio}%, -${100 / window.devicePixelRatio}%)`;
// canvas.style.transform = transform;
// console.log('FUCK', transform);
// document.body.appendChild(canvas);

// display.setOptions({
//   fontSize: 14 * window.devicePixelRatio,
//   bg: '#111',
//   // forceSquareRatio: true,
//   // fontFamily: 'Inconsolata',
//   // spacing: 1.05,
// });

// display.draw(0, 0, '@', '#C0C0C0');
// display.draw(0, 1, '1', '#C0C0C0');
// display.draw(0, 2, '+', '#C0C0C0', '#222');
// display.draw(0, 3, '║', '#C0C0C0', '#222');
// display.draw(0, 5, '╚', '#C0C0C0', '#222');

const map = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 1, 0, 0],
  [0, 1, 1, 2, 1, 1, 0],
  [0, 0, 1, 3, 4, 0, 0],
  [0, 0, 1, 2, 5, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [null],
  [null, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0],
  [null],
  [1, 1, 1, 0],
  [1, 1, 1, 0],
  [1, 1, 1, 0],
  [null],
  [2, 2, 2, 0],
  [2, 2, 2, 0],
  [2, 2, 2, 0],
  [null],
  [3, 3, 3, 0],
  [3, 3, 3, 0],
  [3, 3, 3, 0],
  [null],
  [4, 4, 4, 0],
  [4, 4, 4, 0],
  [4, 4, 4, 0],
  [null],
  [5, 5, 5, 0],
  [5, 5, 5, 0],
  [5, 5, 5, 0],

];


var app = new PIXI.Application(800, 600, {
  backgroundColor: 0x111111,
  width: window.innerWidth / window.devicePixelRatio,
  height: window.innerHeight / window.devicePixelRatio,
  resolution: window.devicePixelRatio,
});
document.body.appendChild(app.view);
const CELL_SIZE = 16;

const container = new PIXI.Container();
container.scale = new PIXI.Point(0.5, 0.5);

const solidG = new PIXI.Graphics();
solidG.beginFill(0xC0C0C0, 1);
solidG.drawRect(0, 0, CELL_SIZE, CELL_SIZE);
solidG.endFill();
const solid = solidG.generateCanvasTexture();

const texture0G = new PIXI.Graphics();
texture0G.beginFill(0xC0C0C0, 1);
for (let x = 0; x < CELL_SIZE; x++) {
  for (let y = 0; y < CELL_SIZE; y += 2) {
    if (x % 2 === 0) {
      texture0G.drawRect(x, y, 1, 1);
    }
  }
  for (let y = 1; y <= CELL_SIZE - 1; y += 2) {
    if (x % 2 === 1) {
      texture0G.drawRect(x, y, 1, 1);
    }
  }
}
texture0G.endFill();
const texture0 = texture0G.generateCanvasTexture();

const texture1G = new PIXI.Graphics();
texture1G.beginFill(0xC0C0C0, 1);
for (let x = 0; x < CELL_SIZE; x++) {
  for (let y = 0; y < CELL_SIZE; y += 4) {
    if (x % 2 === 0) {
      texture1G.drawRect(x, y, 1, 1);
    }
  }

  for (let y = 2; y <= CELL_SIZE - 2; y += 4) {
    if (x % 2 === 1) {
      texture1G.drawRect(x, y, 1, 1);
    }
  }
}
texture1G.endFill();
const texture1 = texture1G.generateCanvasTexture();

const texture2G = new PIXI.Graphics();
texture2G.beginFill(0xC0C0C0, 1);
for (let x = 0; x < CELL_SIZE; x += CELL_SIZE / 4) {
  for (let y = 0; y < CELL_SIZE; y += CELL_SIZE / 4) {
    texture2G.drawRect(x, y, 1, 1);
  }
}
for (let x = CELL_SIZE / 8; x <= CELL_SIZE - 2; x += CELL_SIZE / 4) {
  for (let y = CELL_SIZE / 8; y <= CELL_SIZE - 2; y += CELL_SIZE / 4) {
    texture2G.drawRect(x, y, 1, 1);
  }
}
const texture2 = texture2G.generateCanvasTexture();


const texture3G = new PIXI.Graphics();
texture3G.beginFill(0xC0C0C0, 1);
for (let x = 0; x < CELL_SIZE; x += CELL_SIZE / 4) {
  for (let y = 0; y < CELL_SIZE; y += CELL_SIZE / 4) {
    texture3G.drawRect(x, y, 1, 1);
  }
}
for (let x = 2; x <= CELL_SIZE - 6; x += CELL_SIZE / 2) {
  for (let y = 2; y <= CELL_SIZE - 6; y += CELL_SIZE / 2) {
    texture3G.drawRect(x, y, 1, 1);
  }
}
for (let x = 6; x <= CELL_SIZE - 2; x += CELL_SIZE / 2) {
  for (let y = 6; y <= CELL_SIZE - 2; y += CELL_SIZE / 2) {
    texture3G.drawRect(x, y, 1, 1);
  }
}
const texture3 = texture3G.generateCanvasTexture();

const texture4G = new PIXI.Graphics();
texture4G.beginFill(0xC0C0C0, 1);
for (let x = 0; x < CELL_SIZE; x += CELL_SIZE / 2) {
  for (let y = 0; y < CELL_SIZE; y += CELL_SIZE / 4) {
    texture4G.drawRect(x, y, 1, 1);
  }
}
for (let x = CELL_SIZE / 4; x <= CELL_SIZE - 4; x += CELL_SIZE / 2) {
  for (let y = (CELL_SIZE / 4) - 2; y <= CELL_SIZE; y += CELL_SIZE / 4) {
    texture4G.drawRect(x, y, 1, 1);
  }
}
const texture4 = texture4G.generateCanvasTexture();

const textureIDs = {
  0: solid,
  1: texture0,
  2: texture1,
  3: texture2,
  4: texture3,
  5: texture4,
};
console.log(textureIDs);
for (let y = 0; y < map.length; y++) {
  for (let x = 0; x < map[y].length; x++) {
    const id = map[y][x];
    const texture = textureIDs[id];
    if (texture) {
      const land = new PIXI.Sprite(texture);
      land.x = x * CELL_SIZE;
      land.y = y * CELL_SIZE;

      container.addChild(land);
    }
  }
}

var basicText = new PIXI.Text('@', {
  fontFamily: 'monospace',
  fontSize: 14,
  fill: '#C0C0C0',
});
basicText.x = 0;
basicText.y = 0;

// container.addChild(basicText);
app.stage.addChild(container);
