// Title: Picnic Sudoku
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=dgG10nN6oDM
// Source: https://app.crackingthecryptic.com/sudoku/d2RMB6mjGd

// Normal sudoku. Along thermometers, digits increase from the bulb.
// Outside clues show the sum of the digits strictly between the 1 and the
// 9 in that row/column (a sandwich total); several are printed as
// inequalities rather than exact totals -- each becomes an Or over every
// sandwich total in the structural 0-35 range that satisfies the printed
// relation.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Thermometers: bulb cell first, then the rest of the line to the tip.
// Transcribed from `lines` (grey stroke) with each bulb cross-checked
// against the matching grey circle overlay at that cell.
const THERMOS = [
  ['R4C1', 'R3C1'],
  ['R3C4', 'R3C3', 'R4C3'],
  ['R4C9', 'R3C9', 'R3C8'],
  ['R5C8', 'R4C8'],
  ['R8C8', 'R8C7'],
  ['R9C3', 'R8C3'],
];

// Outside sandwich clues: { cells, rel } where cells run from the clue
// inward (nearest cell first) and rel is either an exact value or an
// inequality on the sandwich total. Transcribed from the top/left overlay
// text; each sits directly above its column or left of its row (no
// diagonal Little-Killer clues are present), matching the rules' plain
// "in that row/column" wording.
const SANDWICH_CLUES = [
  { cells: graph.ray('R1C1', 1, 0), rel: { op: 'gt', bound: 26 } }, // top C1 ">26"
  { cells: graph.ray('R1C2', 1, 0), rel: { op: 'lt', bound: 11 } }, // top C2 "<11"
  { cells: graph.ray('R1C3', 1, 0), rel: { op: 'eq', bound: 16 } }, // top C3 "16"
  { cells: graph.ray('R1C4', 1, 0), rel: { op: 'eq', bound: 9 } },  // top C4 "9"
  { cells: graph.ray('R1C5', 1, 0), rel: { op: 'gt', bound: 27 } }, // top C5 ">27"
  { cells: graph.ray('R1C7', 1, 0), rel: { op: 'gt', bound: 21 } }, // top C7 ">21"
  { cells: graph.ray('R1C9', 1, 0), rel: { op: 'gt', bound: 26 } }, // top C9 ">26"
  { cells: graph.ray('R3C1', 0, 1), rel: { op: 'lt', bound: 5 } },  // left R3 "<5"
  { cells: graph.ray('R7C1', 0, 1), rel: { op: 'lt', bound: 2 } },  // left R7 "<2"
  { cells: graph.ray('R8C1', 0, 1), rel: { op: 'lt', bound: 2 } },  // left R8 "<2"
  { cells: graph.ray('R9C1', 0, 1), rel: { op: 'lt', bound: 2 } },  // left R9 "<2"
];

// Sandwich totals range structurally from 0 (1 and 9 adjacent) to 35
// (digits 2-8 all between them).
const SANDWICH_RANGE = [0, 35];

const relHolds = ({ op, bound }, v) =>
  op === 'lt' ? v < bound : op === 'gt' ? v > bound : v === bound;

const valuesInRange = ([lo, hi], rel) => {
  const out = [];
  for (let v = lo; v <= hi; v++) if (relHolds(rel, v)) out.push(v);
  return out;
};

// An exact clue collapses to a single Sandwich; an inequality clue becomes
// an Or over every structurally possible total satisfying it.
const sandwichClue = ({ cells, rel }) => {
  const values = valuesInRange(SANDWICH_RANGE, rel);
  const options = values.map(v => Sandwich.fromCells(v, cells, geometry));
  return options.length === 1 ? options[0] : new Or(options);
};

return [
  new Shape('9x9'),

  ...THERMOS.map(cells => new Thermo(...cells)),

  ...SANDWICH_CLUES.map(sandwichClue),
];
