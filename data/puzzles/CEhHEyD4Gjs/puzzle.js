// Title: Everything Is Rihgt
// Author: DiMono
// Video: https://www.youtube.com/watch?v=CEhHEyD4Gjs
// Source: https://app.crackingthecryptic.com/sudoku/jq4RbMd67t

// This encodes only the RIGHT (first) solve. The rules also require solving
// a second "Wrogn" grid afterwards in which every clue below is made invalid
// and no cell may repeat its Right-grid digit; that second grid and the
// cross-grid "differs everywhere" constraint are not modeled here.
//
// Killer cages: one exact-sum cage, one no-total cage (all-different only),
// and two cages whose drawn clue is an inequality on the total ("<12" shown
// as a label next to the cage rather than inside it; ">5", "<11" shown as
// the cage's own value) rather than an exact number -- each encoded as an Or
// over every total in a 2-cell cage's possible range (3..17, two distinct
// digits 1-9) that satisfies the inequality.
// Little Killer: five diagonal arrows drawn off-grid, each entering the
// board at an edge cell (not always a grid corner).
// Quadruple: five corner circles.
// Kropki: one white dot (consecutive) and one black dot (ratio 2) are
// drawn; no claim is made about cells without a dot (StrictKropki not used).
// Thermometer: seven thermometers, identified by a wide grey line with a
// round bulb marker at one end (bulb first, values increase to the tip).
// One bulb (R9C5) forks into two arms.
// Palindrome: two 3-cell grey lines of the same colour but with no bulb
// marker and a different (thinner) line weight.
// Maximum/Minimum: cells R3C6 and R8C5 are each drawn with four short tick
// marks, one per orthogonal neighbour. Each mark is a 3-point chevron whose
// middle waypoint is the tip; at R8C5 every tip sits farther from the cell's
// centre than its two flanking points (arrows point outward, past each
// neighbour: Maximum -- greater than every orthogonal neighbour). At R3C6
// every tip sits closer to the cell's centre than its flanking points
// (arrows point inward, from each neighbour: Minimum -- less than every
// orthogonal neighbour).
// XV: four "X" edge marks (sum to 10). No "V" marks are drawn.
// Red clues: twelve outside clues. Per the rules text each is "at least one
// of a valid Skyscraper, X-Sum, or Sandwich clue" for that row/column,
// viewed from the marked side. Several give an inequality ("<3", ">30")
// rather than an exact value. Encoded as Or() over every (type, value)
// combination whose value lies in that type's structural range (Skyscraper
// 1-9, X-Sum 1-45, Sandwich 0-35) and satisfies the stated relation. Some
// combinations are individually unreachable (e.g. an X-Sum of exactly 2 can
// never occur) -- that only makes that one branch of the Or vacuous, never
// an incorrect accept.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const SKY_RANGE = [1, 9];
const XSUM_RANGE = [1, 45];
const SANDWICH_RANGE = [0, 35];
const CAGE2_RANGE = [3, 17]; // two distinct digits from 1-9

function valuesInRange([lo, hi], rel) {
  const out = [];
  for (let v = lo; v <= hi; v++) {
    if (rel.op === 'lt' && v < rel.bound) out.push(v);
    else if (rel.op === 'gt' && v > rel.bound) out.push(v);
    else if (rel.op === 'eq' && v === rel.bound) out.push(v);
  }
  return out;
}

// At least one of Skyscraper/X-Sum/Sandwich holds for `cells` (nearest the
// clue first), at a value satisfying `rel`.
function redClue(cells, rel) {
  const branches = [
    ...valuesInRange(SKY_RANGE, rel).map(v => Skyscraper.fromCells(v, cells, geometry)),
    ...valuesInRange(XSUM_RANGE, rel).map(v => XSum.fromCells(v, cells, geometry)),
    ...valuesInRange(SANDWICH_RANGE, rel).map(v => Sandwich.fromCells(v, cells, geometry)),
  ];
  return new Or(branches);
}

// A 2-cell killer cage whose drawn clue is an inequality on the total.
function cageRange(cells, rel) {
  return new Or(valuesInRange(CAGE2_RANGE, rel).map(v => new Cage(v, ...cells)));
}

const redClues = [
  redClue(graph.ray('R9C1', -1, 0), { op: 'lt', bound: 4 }),  // bottom C1 "<4"
  redClue(graph.ray('R9C2', -1, 0), { op: 'lt', bound: 3 }),  // bottom C2 "<3"
  redClue(graph.ray('R9C6', -1, 0), { op: 'lt', bound: 3 }),  // bottom C6 "<3"
  redClue(graph.ray('R9C8', -1, 0), { op: 'lt', bound: 3 }),  // bottom C8 "<3"
  redClue(graph.ray('R1C9', 0, -1), { op: 'lt', bound: 3 }),  // right R1 "<3"
  redClue(graph.ray('R3C9', 0, -1), { op: 'lt', bound: 3 }),  // right R3 "<3"
  redClue(graph.ray('R1C6', 1, 0), { op: 'gt', bound: 3 }),   // top C6 ">3"
  redClue(graph.ray('R1C4', 1, 0), { op: 'gt', bound: 30 }),  // top C4 ">30"
  redClue(graph.ray('R1C3', 1, 0), { op: 'eq', bound: 4 }),   // top C3 "4"
  redClue(graph.ray('R5C9', 0, -1), { op: 'eq', bound: 3 }),  // right R5 "3"
  redClue(graph.ray('R7C9', 0, -1), { op: 'eq', bound: 8 }),  // right R7 "8"
  redClue(graph.ray('R8C9', 0, -1), { op: 'eq', bound: 2 }),  // right R8 "2"
];

return [
  new Shape('9x9'),

  // Killer cages (raw `cages` array also has 4 metadata-stub entries: title,
  // author, rules text, solution -- not encoded).
  new Cage(7, 'R4C3', 'R4C4'),
  new AllDifferent('R6C6', 'R7C5', 'R7C6'),
  cageRange(['R5C8', 'R6C8'], { op: 'lt', bound: 12 }),
  cageRange(['R8C2', 'R8C3'], { op: 'gt', bound: 5 }),
  cageRange(['R5C9', 'R6C9'], { op: 'lt', bound: 11 }),

  // Little Killer diagonals (off-grid arrows)
  LittleKiller.fromCells(14, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(26, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(19, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(23, graph.ray('R9C6', -1, 1), geometry),

  // Quadruples (corner circles; Quad anchors at the top-left cell of the 2x2)
  new Quad('R7C8', 1, 9),
  new Quad('R4C7', 9),
  new Quad('R4C4', 9),
  new Quad('R1C2', 9),
  new Quad('R1C3', 9),

  // Kropki dots
  new WhiteDot('R6C6', 'R7C6'),
  new BlackDot('R5C3', 'R6C3'),

  // Thermometers (bulb first); the R9C5 bulb forks into two arms
  new Thermo('R9C2', 'R9C3'),
  new Thermo('R9C1', 'R8C1'),
  new Thermo('R9C5', 'R8C6'),
  new Thermo('R9C5', 'R8C4'),
  new Thermo('R8C8', 'R8C7'),
  new Thermo('R9C8', 'R9C7'),
  new Thermo('R6C6', 'R5C6'),
  new Thermo('R8C3', 'R9C4'),

  // Palindromes
  new Palindrome('R8C9', 'R7C8', 'R6C7'),
  new Palindrome('R7C3', 'R6C2', 'R5C2'),

  // Maximum (R8C5): greater than every orthogonal neighbour.
  new GreaterThan('R8C5', 'R7C5', 'R9C5', 'R8C4', 'R8C6'),
  // Minimum (R3C6): less than every orthogonal neighbour -- each neighbour
  // listed ahead of R3C6 so list-order + adjacency gives neighbour > R3C6.
  new GreaterThan('R2C6', 'R4C6', 'R3C5', 'R3C7', 'R3C6'),

  // XV (X = sum to 10; no V marks are drawn in this puzzle)
  new X('R3C4', 'R3C5'),
  new X('R9C5', 'R9C6'),
  new X('R8C9', 'R9C9'),
  new X('R5C2', 'R6C2'),

  // Red clues: at least one of Skyscraper / X-Sum / Sandwich
  ...redClues,
];
