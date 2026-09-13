// Title: Querulous
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=azhcl6ZWI0U
// Source: https://sudokupad.app/2jar2lhcc5

// Normal sudoku rules apply. Cells a knight's move apart cannot repeat a
// digit. There are no givens or cages; every clue is one of the eight
// 3-cell lines below, each drawn in its own colour. All eight lines sum to
// the same (unfixed) total. Box borders split the region-sum line into
// segments of equal sum.
//
// Each line's colour matches exactly one colour named in the rules text
// (three are stored as 4-digit #RGBA shorthand and expand unambiguously:
// #3baf -> #33bbaaff teal, #fcaf -> #ffccaaff peach, #f66f -> #ff6666ff
// red; the rest, #f067f0/#67f067/#2ecbff/#d4af37/#ffa600, are plain pink,
// green, blue, gold and orange).

const teal = ['R2C3', 'R2C4', 'R1C5'];       // modular (mod 3)
const peach = ['R4C7', 'R5C7', 'R6C7'];      // entropic
const pink = ['R4C3', 'R5C3', 'R6C3'];       // renban
const green = ['R8C3', 'R8C4', 'R7C5'];      // german whisper
const red = ['R9C5', 'R8C6', 'R8C7'];        // parity (alternating odd/even)
const blue = ['R2C7', 'R2C6', 'R3C5'];       // region sum
const gold = ['R6C4', 'R6C5', 'R6C6'];       // nabner
const orange = ['R4C4', 'R4C5', 'R4C6'];     // dutch whisper

const allLines = [teal, peach, pink, green, red, blue, gold, orange];

// Nabner: no repeats, and no two digits anywhere on the line (not just
// adjacent) may be consecutive. PairX applies the relation to every pair
// in the cell list, unlike Pair (adjacent pairs only).
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('9x9'),
  new AntiKnight(),

  new Modular(3, ...teal),
  new Entropic(...peach),
  new Renban(...pink),
  new Whisper(5, ...green),
  new Modular(2, ...red),
  new RegionSumLine(...blue),
  new AllDifferent(...gold),
  new PairX(nabnerKey, 'nabner', ...gold),
  new Whisper(4, ...orange),

  new EqualSum(...allLines),
];
