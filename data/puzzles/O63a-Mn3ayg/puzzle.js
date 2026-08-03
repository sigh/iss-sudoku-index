// Title: Taxi Rank
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=O63a-Mn3ayg
// Source: https://sudokupad.app/61f9s2wmr3

// Rules encoded below, in full:
//   Normal sudoku on a 9x9 grid with standard boxes and no givens.
//   Nine coloured routes of six cells each. Read from the route's square
//   marker to its spot marker, a route's digits form a 6-digit route number.
//   The nine route numbers are all different, and rank 1 (lowest) to 9
//   (highest). Five cells are circled and hold a yellow taxi; each such cell
//   lies on exactly one route, and its digit is that route's rank.
//   Blue route: box borders divide it into segments whose digits sum equally.
//   Green route: adjacent digits differ by at least 5.
//   Pink route: the six digits form a non-repeating consecutive set.
// The white road network, the nine numbered taxi bays drawn outside the grid
// to the right, and the hidden per-row/per-column cages (which restate normal
// sudoku) are decoration and are not encoded.

// Cell paths of the nine drawn coloured strokes, listed square marker first
// and spot marker last. The third blue route's stroke is drawn spot-to-square,
// so it is reversed here to match the other eight.
const ROUTES = [
  { colour: 'blue', cells: ['R1C1', 'R2C1', 'R3C1', 'R4C2', 'R3C3', 'R2C4'] },
  { colour: 'blue', cells: ['R9C2', 'R9C3', 'R8C4', 'R9C5', 'R9C6', 'R9C7'] },
  { colour: 'blue', cells: ['R7C6', 'R7C5', 'R7C4', 'R7C3', 'R8C2', 'R9C1'] },
  { colour: 'green', cells: ['R5C7', 'R5C6', 'R6C6', 'R6C7', 'R7C8', 'R7C9'] },
  { colour: 'green', cells: ['R3C7', 'R2C8', 'R3C8', 'R4C8', 'R4C9', 'R5C9'] },
  { colour: 'green', cells: ['R3C6', 'R2C5', 'R2C4', 'R1C4', 'R1C3', 'R2C3'] },
  { colour: 'pink', cells: ['R8C8', 'R8C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9'] },
  { colour: 'pink', cells: ['R2C9', 'R3C8', 'R4C7', 'R4C6', 'R4C5', 'R4C4'] },
  { colour: 'pink', cells: ['R4C3', 'R5C2', 'R6C2', 'R5C1', 'R6C1', 'R7C1'] },
];

// The five circled cells drawn with a yellow taxi inside.
const TAXI_CELLS = ['R1C4', 'R3C3', 'R4C9', 'R6C1', 'R9C2'];

const routeCells = (colour) =>
  ROUTES.filter((r) => r.colour === colour).map((r) => r.cells);

// One variable per route holding that route's rank. Var cells take the grid's
// 1-9 range, so AllDifferent over all nine makes them a permutation of 1..9.
const rank = new Var('R', 'route rank', ROUTES.length);
const rankOf = (i) => rank.cell(i + 1);

// Compares two route numbers and checks that comparison against the two
// routes' ranks. The machine reads rank(i), then rank(j), then the two routes'
// digits interleaved: i1, j1, i2, j2, ... i6, j6.
//   p:0, p:1 - reading the two ranks. `ri` carries rank(i) until rank(j)
//              arrives; the pair then fixes `dir`, the order the ranks require
//              of the two numbers ('lt' = route i's number must be smaller).
//   hold     - null while route i's digit for the current position is still to
//              come, otherwise that digit, held until route j's arrives.
// The first position where the two digits differ decides the comparison; it
// must agree with `dir`, after which `ok` absorbs the remaining input. An
// input that never decides has two identical route numbers and never reaches
// the accepting state, which is the "none of the route numbers are the same"
// clause.
const cmpSpec = NFA.encodeSpec({
  startState: { p: 0 },
  transition: (s, v) => {
    if (s.ok) return s;
    if (s.p === 0) return { p: 1, ri: v };
    if (s.p === 1) {
      if (v === s.ri) return undefined;
      return { dir: v > s.ri ? 'lt' : 'gt', hold: null };
    }
    if (s.hold === null) return { dir: s.dir, hold: v };
    if (s.hold === v) return { dir: s.dir, hold: null };
    const cmp = s.hold < v ? 'lt' : 'gt';
    return cmp === s.dir ? { ok: true } : undefined;
  },
  accept: (s) => s.ok === true,
  maxDepth: 2 + 2 * ROUTES[0].cells.length,  // 2 ranks + 12 interleaved digits
}, 9);

const routePairs = ROUTES.flatMap((_, i) =>
  ROUTES.slice(i + 1).map((_, k) => [i, i + 1 + k]));

return [
  new Shape('9x9'),
  rank,
  new AllDifferent(...rank.cells()),

  ...routeCells('blue').map((cells) => new RegionSumLine(...cells)),
  ...routeCells('green').map((cells) => new Whisper(5, ...cells)),
  ...routeCells('pink').map((cells) => new Renban(...cells)),

  // Each taxi cell lies on exactly one route, so the route a taxi marks is
  // found by membership.
  ...TAXI_CELLS.map((cell) => new SameValues(
    2, cell, rankOf(ROUTES.findIndex((r) => r.cells.includes(cell))))),

  ...routePairs.map(([i, j]) => new NFA(
    cmpSpec, `rank_${i + 1}_${j + 1}`,
    [rankOf(i), rankOf(j),
    ...ROUTES[i].cells.flatMap((c, k) => [c, ROUTES[j].cells[k]])])),
];
