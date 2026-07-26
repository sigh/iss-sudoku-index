// Title: Killer at large in the fog: #3
// Author: Fenners
// Video: https://www.youtube.com/watch?v=22wKEU-kX0w
// Source: https://sudokupad.app/atvcydetiu

// Normal 9x9 sudoku, standard 3x3 boxes (default Shape regions match the
// drawn `regions`). No givens.
//
// Dynamic Fog is a solving-UI reveal mechanic with no effect on the final
// grid; not encoded. Per the rules ("They are snipped so they can't been
// seen through smudge"), the arrows and lines below are drawn on the payload
// as a full faint guide path plus a set of short, thick fragments that are
// progressively revealed as fog clears -- the fragments duplicate parts of
// the same guide path rather than encoding extra clues, so only the full
// path of each line/arrow is encoded here.
//
// The "killer's name" reveal (digits in cells with an outlined box) has no
// stated digit-to-letter mapping and adds no constraint on grid values.

const arrows = [
  // Bulb cell first, then arm cells, from the drawn arrow paths.
  ['R8C4', 'R9C5', 'R9C6', 'R9C7', 'R8C8'],
  ['R2C4', 'R3C5', 'R3C6', 'R3C7', 'R2C8'],
  ['R6C4', 'R5C5', 'R5C6', 'R5C7', 'R6C8'],
  ['R3C3', 'R3C2', 'R3C1'],
  ['R9C3', 'R9C2', 'R8C1', 'R7C1', 'R6C2'],
  ['R5C3', 'R6C3', 'R7C3'],
].map(cells => new Arrow(...cells));

// German Whispers (green line): adjacent digits differ by at least 5.
const whisper = new Whisper(5, 'R1C3', 'R1C4');

// Parity Line (red line): adjacent digits alternate even/odd. No built-in
// parity-line class, so a custom pairwise predicate over consecutive cells.
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const parityLine = new Pair(parityKey, 'Parity Line', 'R4C4', 'R4C3', 'R5C2');

// Modular Line (teal line): every 3 consecutive cells contain one digit from
// each of {1,4,7}, {2,5,8}, {3,6,9}.
const modularLine = new Modular(3, 'R9C9', 'R8C9', 'R7C8', 'R6C7');

// Entropic Line (peach line): every 3 consecutive cells contain one digit
// from each of {1,2,3}, {4,5,6}, {7,8,9}.
const entropicLine = new Entropic('R1C9', 'R1C8', 'R2C7', 'R3C6', 'R4C7');

// Region Sum Line (blue line): equal sum within each box the line passes
// through.
const regionSumLine = new RegionSumLine(
  'R2C5', 'R3C4', 'R4C5', 'R5C6', 'R6C5', 'R7C6', 'R8C5', 'R9C6');

return [
  new Shape('9x9'),
  ...arrows,
  whisper,
  parityLine,
  modularLine,
  entropicLine,
  regionSumLine,
];
