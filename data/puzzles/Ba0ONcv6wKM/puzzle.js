// Title: Lasciate ogni speranza, voi ch'entrate
// Author: Dolf the Undead Viking
// Video: https://www.youtube.com/watch?v=Ba0ONcv6wKM
// Source: https://app.crackingthecryptic.com/sudoku/M7T27mngLR

// Normal sudoku rules apply, standard 3x3 boxes, no givens. Little Killer:
// each off-grid diagonal arrow sums the digits along the indicated diagonal,
// repeats allowed (LittleKiller's own semantics, no Cage uniqueness). Along
// each thermometer digits strictly increase from the bulb (Thermo, bulb
// first). White dots join consecutive digits, black dots join a 1:2 ratio;
// the rules do not claim every such pair is marked, so only the drawn dots
// are constrained (no StrictKropki).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Off-grid diagonal sum clues, transcribed from the drawn arrow direction
// and paired outside-grid number for each corner of the frame.
const littleKillers = [
  LittleKiller.fromCells(33, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(23, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(8, graph.ray('R2C1', -1, 1), geometry),
  LittleKiller.fromCells(6, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(6, graph.ray('R2C9', -1, -1), geometry),
  LittleKiller.fromCells(8, graph.ray('R8C9', 1, -1), geometry),
  LittleKiller.fromCells(38, graph.ray('R9C4', -1, 1), geometry),
  LittleKiller.fromCells(32, graph.ray('R9C6', -1, -1), geometry),
];

// Thermometer cell lists, bulb-first; transcribed from the drawn lines and
// their grey circle bulb markers.
const thermos = [
  ['R1C9', 'R2C9', 'R2C8', 'R1C8'],
  ['R2C2', 'R1C2', 'R1C1', 'R2C1'],
  ['R8C8', 'R9C8', 'R9C9', 'R8C9'],
  ['R9C1', 'R8C1', 'R8C2', 'R9C2'],
];

// White (consecutive) dot edges, transcribed from the drawn white-filled
// overlays.
const whiteDots = [
  ['R7C1', 'R7C2'],
  ['R7C4', 'R7C5'],
  ['R7C5', 'R7C6'],
  ['R8C7', 'R9C7'],
  ['R6C7', 'R7C7'],
  ['R5C7', 'R6C7'],
  ['R3C8', 'R3C9'],
  ['R1C3', 'R2C3'],
  ['R3C3', 'R4C3'],
];

// Black (1:2 ratio) dot edges, transcribed from the drawn black-filled
// overlays.
const blackDots = [
  ['R3C3', 'R3C4'],
  ['R3C4', 'R3C5'],
  ['R3C6', 'R3C7'],
  ['R4C7', 'R5C7'],
  ['R5C3', 'R6C3'],
];

return [
  new Shape('9x9'),
  ...littleKillers,
  ...thermos.map(cells => new Thermo(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
