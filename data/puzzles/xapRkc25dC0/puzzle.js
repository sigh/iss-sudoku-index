// Title: Nine Arrows
// Author: Henrik Jacobsen
// Video: https://www.youtube.com/watch?v=xapRkc25dC0
// Source: https://app.crackingthecryptic.com/sudoku/G6h4Jt3tRm

// Rules encoded: normal sudoku; anti-knight (identical digits cannot be a
// knight's move apart); the R1C1-R9C9 diagonal sums to 55 (repeats allowed,
// per LittleKiller semantics -- no all-different is stated for the
// diagonal); a 2x2 killer cage (R8C1,R9C1,R9C2,R8C2) sums to 30; nine
// arrows, each an unlabelled circle (bulb) whose solved digit equals the
// sum of its arm cells; the nine bulb digits are all different.
//
// Every arrow overlay is drawn with empty text -- "the number in the
// circle" is the bulb cell's own solved digit, not a printed total (the
// only printed circle total is the diagonal's 55). This matches the
// standard Arrow class: bulb cell first, then arm cells in order.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Bulb (circle overlay) + arm cells for each of the nine drawn arrows;
// each arrow's first path cell matches a circle overlay position.
const arrows = [
  ['R1C3', 'R1C2', 'R1C1'],
  ['R3C5', 'R3C4', 'R2C4'],
  ['R5C3', 'R5C4', 'R5C5', 'R4C5', 'R3C6', 'R2C5'],
  ['R4C9', 'R4C8', 'R5C8'],
  ['R5C7', 'R5C6', 'R5C5'],
  ['R7C5', 'R6C5', 'R5C4'],
  ['R7C3', 'R8C4'],
  ['R6C7', 'R7C8'],
  ['R8C5', 'R8C6', 'R9C6'],
];

return [
  new AntiKnight(),

  // Killer cage, top-left value 30.
  new Cage(30, 'R8C1', 'R9C1', 'R9C2', 'R8C2'),

  // Diagonal sum clue: off-grid circle "55" at the R1C1 corner, ray down-right.
  LittleKiller.fromCells(55, graph.ray('R1C1', 1, 1), geometry),

  ...arrows.map(cells => new Arrow(...cells)),

  // "The numbers in the circles of the arrows are all different": the nine
  // bulb cells' solved digits (each equal to its arrow's sum) must differ.
  new AllDifferent(...arrows.map(cells => cells[0])),
];
