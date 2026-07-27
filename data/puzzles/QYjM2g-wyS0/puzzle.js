// Title: Wessel Strijkstra
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=QYjM2g-wyS0
// Source: https://sudokupad.app/e7g39h4vyj

// Rules encoded:
// - Sudoku: rows, columns and the six 2x3 boxes hold 1-6 once each (ISS's
//   default 6x6 box tiling matches the payload's drawn regions exactly).
// - Even: R1C1 (the grey square underlay) is even.
// - Cipher: the puzzle draws exactly ten distinct letters -- W,E,S,L (spelling
//   WESSEL along the diagonal) and R,A,T,I,J,K (inside the cage-total tiles,
//   spelling STRIJKSTRA) -- matching the ten digits 0-9 exactly, so "each
//   letter corresponds to a unique digit" is read as a bijection over 0-9:
//   the Sudoku rule states its range as "digits 1-6" explicitly, while the
//   cipher rule says only "a digit" (unqualified), so the cipher is not read
//   as inheriting the grid's narrower range. A cell drawn with exactly one
//   letter holds that letter's digit; the rule only pins a cell this way when
//   its own tile carries a single letter, so the two-letter cage-total tiles
//   below do not themselves constrain their own cell's grid value.
// - Modified killer cages: repeats allowed within a cage (Sum, not Cage);
//   each cage's total is the two-digit number named by the two-letter tile
//   drawn inside it (first letter = tens, second = units): RA, ST, RI, JK,
//   ST for the five cages below -- ST is drawn in two different cages,
//   tying their totals together.
// The main Shape is widened to 0-9 so the cipher Vars can hold any digit;
// the playable grid cells are pinned back to 1-6 with a Replicate'd Given.

const graph = cellGraph('6x6');
const gridCells = graph.cells();

const W = new Var('W', 'W');
const E = new Var('E', 'E');
const S = new Var('S', 'S');
const L = new Var('L', 'L');
const R = new Var('R', 'R');
const A = new Var('A', 'A');
const T = new Var('T', 'T');
const I = new Var('I', 'I');
const J = new Var('J', 'J');
const K = new Var('K', 'K');

return [
  new Shape('6x6', '0-9'),

  // Pin the main grid back to its true 1-6 range (see header: the shape was
  // widened only so the cipher Vars below can hold any digit 0-9).
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6)),

  // Even grey square (underlay #0, R1C1).
  new Given('R1C1', 2, 4, 6),

  W, E, S, L, R, A, T, I, J, K,
  new AllDifferent('VW', 'VE', 'VS', 'VL', 'VR', 'VA', 'VT', 'VI', 'VJ', 'VK'),

  // Single-letter cipher givens (WESSEL diagonal, underlays #1-#6): a cell
  // drawn with one letter equals that letter's digit.
  new SameValues(2, 'R6C1', 'VW'),
  new SameValues(3, 'R5C2', 'R2C5', 'VE'),
  new SameValues(3, 'R4C3', 'R3C4', 'VS'),
  new SameValues(2, 'R1C6', 'VL'),

  // Modified killer cages (repeats allowed): total = 10*tens + units read
  // from the cage's own drawn two-letter tile.
  // Cage R1C4,R1C5,R1C6,R2C4,R2C6,R3C6 -- tile "RA" at R2C6.
  new Sum(0, 'R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C6', 'R3C6', ['VR', -10], ['VA', -1]),
  // Cage R4C1,R4C2,R5C1,R6C1,R6C2,R6C3 -- tile "ST" at R6C2.
  new Sum(0, 'R4C1', 'R4C2', 'R5C1', 'R6C1', 'R6C2', 'R6C3', ['VS', -10], ['VT', -1]),
  // Cage R5C2,R5C3,R5C4,R6C4 -- tile "RI" at R5C3.
  new Sum(0, 'R5C2', 'R5C3', 'R5C4', 'R6C4', ['VR', -10], ['VI', -1]),
  // Cage R1C2,R1C3,R2C1,R2C2,R2C3,R3C1,R3C2,R3C3,R3C4,R4C3,R4C4 -- tile "JK" at R4C4.
  new Sum(0, 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R4C3', 'R4C4', ['VJ', -10], ['VK', -1]),
  // Cage R2C5,R3C5,R4C5,R4C6 -- tile "ST" at R3C5 (same S,T as the R4C1.. cage).
  new Sum(0, 'R2C5', 'R3C5', 'R4C5', 'R4C6', ['VS', -10], ['VT', -1]),
];
