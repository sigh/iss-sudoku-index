// Title: Tribute To Gene Roddenberry
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=bKUhZKtv9q4
// Source: https://app.crackingthecryptic.com/sudoku/TrFhNFqBLT

// Normal sudoku rules apply (standard 3x3 boxes, from the payload's own
// region list). Three killer cages (distinct + sum, clue in the top-left
// cell). Six thermometers, drawn as three grey-circle bulbs each splitting
// into two arms (two stroke entries sharing a bulb cell) -- one Thermo per
// arm, bulb first. Two outside diagonal-sum (Little Killer) clues. One
// unarrowed outside clue giving the column-4 sandwich total between the 1
// and the 9 (Sandwich). Two white dots (consecutive digits); the rules say
// not every possible dot is drawn, so no negative constraint is added for
// undotted pairs.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new Given('R1C9', 6),
  new Given('R5C5', 6),
  new Given('R8C5', 1),
  new Given('R9C9', 9),

  new Cage(21, 'R4C9', 'R4C8', 'R5C8', 'R5C9', 'R6C9', 'R6C8'),
  new Cage(8, 'R4C5', 'R4C6'),
  new Cage(19, 'R4C4', 'R5C4', 'R6C4', 'R7C4'),

  // Bulb R1C5 splits into two arms (two separate stroke entries sharing the
  // grey-circle bulb cell).
  new Thermo('R1C5', 'R2C4', 'R3C4', 'R4C3', 'R5C3'),
  new Thermo('R1C5', 'R2C6', 'R3C6', 'R4C7'),
  // Bulb R9C2 splits into two arms.
  new Thermo('R9C2', 'R8C2', 'R7C2', 'R6C3'),
  new Thermo('R9C2', 'R9C3', 'R8C4', 'R7C5'),
  // Bulb R9C8 splits into two arms.
  new Thermo('R9C8', 'R8C8', 'R7C8', 'R6C7', 'R5C7'),
  new Thermo('R9C8', 'R8C7', 'R7C6'),

  LittleKiller.fromCells(8, graph.ray('R4C1', -1, 1), geometry),
  LittleKiller.fromCells(19, graph.ray('R5C1', -1, 1), geometry),

  Sandwich.fromCells(21, graph.column(4), geometry),

  new WhiteDot('R4C1', 'R5C1'),
  new WhiteDot('R4C9', 'R5C9'),
];
