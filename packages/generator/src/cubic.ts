export function cubicNoiseConfig(seed, octave, periodx = 4294967296, periody = 4294967296) {
  return {
    'seed': seed,
    'octave': octave,
    'periodx': periodx,
    'periody': periody
  };
}

export function tile(coordinate, period) {
  return coordinate % period;
}

export function randomize(seed, x, y) {
  var RND_A = 134775813;
  var RND_B = 1103515245;

  return (((((x ^ y) * RND_A) ^ (seed + x)) * (((RND_B * x) << 16) ^ (RND_B * y) - RND_A)) >>> 0) / 4294967295;
}

export function interpolate(a, b, c, d, x) {
  var p = (d - c) - (a - b);

  return x * (x * (x * p + ((a - b) - p)) + (c - a)) + b;
}

export function cubicNoiseSample(config, x, y) {
  var xi = Math.floor(x / config.octave);
  var lerpx = x / config.octave - xi;
  var yi = Math.floor(y / config.octave);
  var lerpy = y / config.octave - yi;

  var xSamples = new Array(4);

  for (var i = 0; i < 4; ++i)
    xSamples[i] = interpolate(
      randomize(config.seed, tile(xi - 1, config.periodx), tile(yi - 1 + i, config.periody)),
      randomize(config.seed, tile(xi, config.periodx), tile(yi - 1 + i, config.periody)),
      randomize(config.seed, tile(xi + 1, config.periodx), tile(yi - 1 + i, config.periody)),
      randomize(config.seed, tile(xi + 2, config.periodx), tile(yi - 1 + i, config.periody)),
      lerpx);

  return interpolate(xSamples[0], xSamples[1], xSamples[2], xSamples[3], lerpy) * 0.5 + 0.25;
}
