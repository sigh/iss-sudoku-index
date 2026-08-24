// Title: Between Knights and Arrows
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=Tpk3ga2T9Ps
// Source: https://app.crackingthecryptic.com/sudoku/BJRQ4DnFp3

// Normal sudoku (default Shape('9x9') box regions match the payload's own
// nine 3x3 `regions`). Anti-knight: no two cells a knight's move apart repeat
// a digit. Three Between lines: digits strictly between the values in the
// two circled end cells (Between's own semantics -- see class DESCRIPTION).
// Six arrows: arm digits sum to the digit in the circled bulb cell (Arrow's
// own semantics); the rules text explicitly allows arm digits to repeat, so
// no extra AllDifferent is added over the arms.
//
// Between-line and arrow cell paths are transcribed from the drawn polylines
// (grey circles mark Between-line ends, white circles mark arrow bulbs; both
// circle sets match the recovered endpoints exactly).

return [
  new AntiKnight(),

  // Between lines: ends first/last are the circled bound cells.
  new Between('R2C3', 'R2C4', 'R1C5', 'R2C6'),
  new Between('R5C3', 'R4C3', 'R3C3', 'R2C2', 'R3C1', 'R4C1', 'R5C2', 'R6C2'),
  new Between('R7C2', 'R8C2', 'R9C3', 'R9C4', 'R8C5', 'R7C4', 'R7C3', 'R6C3'),

  // Arrows: bulb cell first, then arm cells in drawn order.
  new Arrow('R1C1', 'R2C1', 'R1C2'),
  new Arrow('R5C5', 'R4C4', 'R3C4', 'R2C5'),
  new Arrow('R5C5', 'R4C6', 'R3C6'),
  new Arrow('R6C7', 'R5C8', 'R6C9'),
  new Arrow('R6C7', 'R7C7', 'R8C8', 'R7C9'),
  new Arrow('R9C7', 'R8C6'),
];
