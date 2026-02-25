// @ts-nocheck
// ==========================================================================
// Mersenne Twister PRNG
// ==========================================================================

var MersenneTwister;

(function () {
  var $next = "$__next__";

  var N = 624;
  var M = 397;
  var MAG01 = [0x0, 0x9908b0df];

  var F = MersenneTwister = function () {
    this.mt = new Array(N);
    this.mti = N + 1;

    var a = arguments;
    switch (a.length) {
      case 0:
        this.setSeed(new Date().getTime());
        break;
      case 1:
        this.setSeed(a[0]);
        break;
      default:
        var seeds = new Array();
        for (var i = 0; i < a.length; ++i) {
          seeds.push(a[i]);
        }
        this.setSeed(seeds);
        break;
    }
  };

  var FP = F.prototype;

  FP.setSeed = function () {
    var a = arguments;
    switch (a.length) {
      case 1:
        if (a[0].constructor === Number) {
          this.mt[0] = a[0];
          for (var i = 1; i < N; ++i) {
            var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] = ((1812433253 * ((s & 0xffff0000) >>> 16))
              << 16)
              + 1812433253 * (s & 0x0000ffff)
              + i;
          }
          this.mti = N;
          return;
        }

        this.setSeed(19650218);

        var l = a[0].length;
        var i = 1;
        var j = 0;

        for (var k = N > l ? N : l; k != 0; --k) {
          var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)
          this.mt[i] = (this.mt[i]
            ^ (((1664525 * ((s & 0xffff0000) >>> 16)) << 16)
              + 1664525 * (s & 0x0000ffff)))
            + a[0][j]
            + j;
          if (++i >= N) {
            this.mt[0] = this.mt[N - 1];
            i = 1;
          }
          if (++j >= l) {
            j = 0;
          }
        }

        for (var k = N - 1; k != 0; --k) {
          var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
          this.mt[i] = (this.mt[i]
            ^ (((1566083941 * ((s & 0xffff0000) >>> 16)) << 16)
              + 1566083941 * (s & 0x0000ffff)))
            - i;
          if (++i >= N) {
            this.mt[0] = this.mt[N - 1];
            i = 1;
          }
        }

        this.mt[0] = 0x80000000;
        return;
      default:
        var seeds = new Array();
        for (var i = 0; i < a.length; ++i) {
          seeds.push(a[i]);
        }
        this.setSeed(seeds);
        return;
    }
  };

  FP[$next] = function (bits) {
    if (this.mti >= N) {
      var x = 0;

      for (var k = 0; k < N - M; ++k) {
        x = (this.mt[k] & 0x80000000) | (this.mt[k + 1] & 0x7fffffff);
        this.mt[k] = this.mt[k + M] ^ (x >>> 1) ^ MAG01[x & 0x1];
      }
      for (var k = N - M; k < N - 1; ++k) {
        x = (this.mt[k] & 0x80000000) | (this.mt[k + 1] & 0x7fffffff);
        this.mt[k] = this.mt[k + (M - N)] ^ (x >>> 1) ^ MAG01[x & 0x1];
      }
      x = (this.mt[N - 1] & 0x80000000) | (this.mt[0] & 0x7fffffff);
      this.mt[N - 1] = this.mt[M - 1] ^ (x >>> 1) ^ MAG01[x & 0x1];

      this.mti = 0;
    }

    var y = this.mt[this.mti++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> (32 - bits);
  };

  FP.nextBoolean = function () {
    return this[$next](1) == 1;
  };

  FP.nextInteger = function () {
    return this[$next](32);
  };

  FP.nextLong = function () {
    return this[$next](25) * 2097152 + this[$next](25);
  };

  FP.nextFloat = function () {
    return this[$next](32) / 4294967296.0;
    // 2^32
  };

  FP.nextDouble = function () {
    return (this[$next](25) * 2097152 + this[$next](25))
      / 70368744177664.0;
    // 2^46
  };

})();

var __mersenne_instance__ = new MersenneTwister();

export var random = function (s?) {
  if (s) __mersenne_instance__.setSeed(s)
  return __mersenne_instance__.nextFloat();
}

export function rand(max, min?) {
  if (min) return Math.round(random() * (max - min) + min);
  else return Math.round(random() * max);
}

export function randf(max, min?) {
  if (min) return random() * (max - min) + min;
  else return random() * max;
}

export function _rand(max, min?) {
  if (min) return Math.round(Math.random() * (max - min) + min);
  else return Math.round(Math.random() * max);
}

export function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
  return function () {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}
