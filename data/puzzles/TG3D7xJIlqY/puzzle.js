// Title: unknown
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=TG3D7xJIlqY
// Source: https://app.crackingthecryptic.com/sudoku/4H9bNPNQRr
//
// Normal sudoku rules apply (default 9x9 boxes, matching the payload's
// region array). Digits strictly increase along thermometers from the bulb
// -> Thermo. Cages show their sums; every cage's cells already share a row,
// column or box, so Cage's built-in all-different is inert here, not a
// narrowing. Outside clues show the total of the indicated diagonal and
// allow repeats -> LittleKiller, matched to its drawn diagonal via the
// paired arrow's direction (arrow entries carry no rule of their own beyond
// fixing that direction).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new Given('R4C4', 1),
  new Given('R6C6', 5),

  // Thermometers, bulb-first (grey circle overlay marks the bulb cell).
  new Thermo('R4C2', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3'),
  new Thermo('R3C8', 'R3C7', 'R4C6', 'R5C7', 'R6C8', 'R7C7', 'R7C6'),

  // Cages, all sum 15 (drawn cage clues, each labelled 15).
  new Cage(15, 'R1C1', 'R1C2'),
  new Cage(15, 'R8C1', 'R9C1'),
  new Cage(15, 'R9C8', 'R9C9'),
  new Cage(15, 'R1C9', 'R2C9'),
  new Cage(15, 'R1C4', 'R2C4', 'R2C5'),
  new Cage(15, 'R8C5', 'R8C6', 'R9C5'),

  // Outside diagonal clues, all total 15; direction from each drawn arrow.
  LittleKiller.fromCells(15, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R9C7', -1, 1), geometry),
];
