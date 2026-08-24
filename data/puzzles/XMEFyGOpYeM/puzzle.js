// Title: Snooker Table
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=XMEFyGOpYeM
// Source: https://app.crackingthecryptic.com/sudoku/P823fGjhPL

// Normal sudoku rules (9x9, default rows/columns/boxes) plus:
// - Thermometers: digits increase from the bulb end.
// - Cages: digits sum to the given total and do not repeat.
// - An outside diagonal clue: digits on the indicated diagonal sum to the
//   given total (little-killer style; no distinctness implied by the clue
//   itself).
// - White dots: joined digits are consecutive. Black dots: joined digits
//   are in a 1:2 ratio. Not all possible dots are given (rules text), so
//   unmarked adjacent pairs carry no constraint -- no StrictKropki.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Cages (drawn dashed-total groups; cell lists transcribed from the art).
  new Cage(7, 'R3C5', 'R3C6'),
  new Cage(14, 'R3C4', 'R4C4', 'R4C5', 'R4C6'),
  new Cage(15, 'R7C5', 'R8C5', 'R8C4', 'R8C6'),

  // Thermometers (drawn grey paths; bulb cells confirmed by a grey circle
  // marker at R1C3, R1C7, R5C3, R5C7, R9C3, R9C7). The two thermos through
  // R5C3 and the two through R5C7 are each a single bulb with two increasing
  // arms: both lines share that bulb cell as their circled endpoint, so each
  // arm is its own increasing Thermo from the common bulb.
  new Thermo('R1C3', 'R1C4', 'R1C5'),
  // Line drawn tip-first (waypoints end at the bulb); bulb confirmed at
  // R1C7 by its circle overlay, so the cell order is reversed here.
  new Thermo('R1C7', 'R1C6'),
  new Thermo('R5C3', 'R4C3', 'R3C3', 'R2C3'),
  new Thermo('R5C3', 'R6C3', 'R7C3', 'R8C3'),
  new Thermo('R5C7', 'R4C7', 'R3C7', 'R2C7'),
  new Thermo('R5C7', 'R6C7', 'R7C7', 'R8C7'),
  new Thermo('R9C3', 'R9C4'),
  new Thermo('R9C7', 'R9C6', 'R9C5'),

  // Outside diagonal-sum clue: a "7" is printed outside the grid beside row
  // 6, with an arrow pointing down-right into the grid from that spot. The
  // arrow's drawn direction resolves the R7C1-vs-R6C1 waypoint ambiguity and
  // selects the down-right diagonal (R7C1-R8C2-R9C3) over the longer
  // up-right diagonal that also touches R6C1's row.
  LittleKiller.fromCells(7, graph.ray('R7C1', 1, 1), geometry),

  // White dots: consecutive (drawn as small white-filled rounded edge
  // marks).
  new WhiteDot('R1C5', 'R1C6'),
  new WhiteDot('R4C2', 'R4C3'),
  new WhiteDot('R5C5', 'R6C5'),
  new WhiteDot('R3C7', 'R3C8'),
  new WhiteDot('R7C7', 'R7C8'),
  new WhiteDot('R9C4', 'R9C5'),
  new WhiteDot('R7C2', 'R8C2'),
  new WhiteDot('R5C9', 'R6C9'),
  new WhiteDot('R8C8', 'R8C9'),
  new WhiteDot('R9C8', 'R9C9'),

  // Black dots: 1:2 ratio (drawn as small black-filled rounded edge marks).
  new BlackDot('R8C9', 'R9C9'),
  new BlackDot('R4C9', 'R5C9'),
  new BlackDot('R4C5', 'R4C6'),
  new BlackDot('R4C4', 'R4C5'),
  new BlackDot('R6C1', 'R6C2'),
  new BlackDot('R8C1', 'R8C2'),
];
