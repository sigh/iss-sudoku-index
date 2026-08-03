// Title: The Door around the Corner
// Author: XeonRisq
// Video: https://www.youtube.com/watch?v=716VK2JTMmo
// Source: https://app.crackingthecryptic.com/sudoku/Q2FPmtQ8FN

// Normal sudoku (default 3x3 boxes, no jigsaw). One given: R8C7=8.
//
// Beige lines: every 3 sequential cells hold one low(1-3)/mid(4-6)/high(7-9)
// digit -- Entropic, as drawn.
// Blue lines: every 3 sequential cells must NOT hold one of each band --
// no dedicated class, so a small NFA tracks the last two cells' bands and
// rejects a window whose three bands are all different.
//
// Outside diagonal arrows: each entry cell + initial 45-degree direction
// starts a ray that runs straight, reflects once off the first edge it
// meets (the axis that would leave the grid flips sign), and stops at the
// next edge -- always 9 cells (verified against the rules' own example:
// R1C5 down-left reflects at R5C1 and its 6th cell, R6C2, is the one
// checked). Let N be the digit in the ray's first cell; the clue's digit X
// must sit at the ray's Nth cell, and must not appear in any earlier cell
// of the ray (X's first occurrence is at N). Entry cells/directions read
// off `arrows[]`; each ray's target digit X read off the nearest `overlays[]`
// text. Arrows 0 (R4C1, up-right) and 1 (R6C1, down-right) are equidistant
// from the single "5" printed at their shared lane -- which one it labels
// is undecidable from the payload, so both readings are kept and the
// digit-5 rule is required of at least one of the two rays.

const GRID = 9;

// Simulate one arrow's ray: start at (row, col) heading (dr, dc); whichever
// axis would step off the grid flips sign (a single reflection); continue to
// the next edge. Always yields GRID cells for a GRIDxGRID board entered on an
// edge (not a corner).
function bounceRay(row, col, dr, dc) {
  const cells = [];
  for (let i = 0; i < GRID; i++) {
    cells.push(makeCellId(row, col));
    const nr = row + dr, nc = col + dc;
    if (nr < 1 || nr > GRID) dr = -dr;
    if (nc < 1 || nc > GRID) dc = -dc;
    row += dr; col += dc;
  }
  return cells;
}

// Entry cell, initial direction and target digit X for each of the 11 drawn
// arrows, in `arrows[]` order (row, col, dr, dc, x).
const arrowSpecs = [
  { idx: 0, row: 4, col: 1, dr: -1, dc: +1, x: 5 }, // left edge, up-right (tied with #1, see header)
  { idx: 1, row: 6, col: 1, dr: +1, dc: +1, x: 5 }, // left edge, down-right (tied with #0)
  { idx: 2, row: 3, col: 1, dr: +1, dc: +1, x: 4 },
  { idx: 3, row: 7, col: 1, dr: -1, dc: +1, x: 5 },
  { idx: 4, row: 1, col: 2, dr: +1, dc: +1, x: 5 },
  { idx: 5, row: 1, col: 5, dr: +1, dc: -1, x: 5 },
  { idx: 6, row: 1, col: 8, dr: +1, dc: +1, x: 5 },
  { idx: 7, row: 3, col: 9, dr: -1, dc: -1, x: 5 },
  { idx: 8, row: 6, col: 9, dr: -1, dc: -1, x: 2 },
  { idx: 9, row: 9, col: 8, dr: -1, dc: +1, x: 3 },
  { idx: 10, row: 9, col: 5, dr: -1, dc: -1, x: 3 },
];

const rays = arrowSpecs.map(a => ({ ...a, cells: bounceRay(a.row, a.col, a.dr, a.dc) }));

// NFA: let N be the value of the first cell. Require the Nth cell to equal x,
// and require no earlier cell to equal x (so N is x's first occurrence).
// State carries n (the first cell's value, once read), pos (cells consumed)
// and seenX (whether the Nth-cell check has already fired).
function indexNfaSpec(x) {
  return NFA.encodeSpec({
    startState: { n: null, pos: 0, seenX: false },
    transition: ({ n, pos, seenX }, value) => {
      const newPos = pos + 1;
      const n2 = n === null ? value : n;
      if (newPos < n2) {
        if (value === x) return undefined; // x may not occur before position n
        return { n: n2, pos: newPos, seenX: false };
      }
      if (newPos === n2) {
        if (value !== x || seenX) return undefined; // position n must be x, first time
        return { n: n2, pos: newPos, seenX: true };
      }
      return { n: n2, pos: newPos, seenX: true }; // after position n: unconstrained
    },
    accept: ({ pos }) => pos === GRID,
    maxDepth: GRID, // each ray is exactly GRID cells, single segment
  }, 9);
}

const indexSpecCache = new Map();
function indexNfa(x, ...cells) {
  if (!indexSpecCache.has(x)) indexSpecCache.set(x, indexNfaSpec(x));
  return new NFA(indexSpecCache.get(x), `IDX${x}`, ...cells);
}

const tiedRays = rays.filter(r => r.idx === 0 || r.idx === 1);
const plainRays = rays.filter(r => r.idx !== 0 && r.idx !== 1);

const indexConstraints = [
  ...plainRays.map(r => indexNfa(r.x, ...r.cells)),
  // Arrow 0 or arrow 1 carries the shared "5" -- require at least one.
  new Or(tiedRays.map(r => indexNfa(r.x, ...r.cells))),
];

// Beige lines: lines[0..3], #EB7532, thickness 8.
const beigeLines = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3'],
];

// Blue lines: lines[4..7], #34BBE6, thickness 8.
const blueLines = [
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
];

function bandOf(v) { return Math.floor((v - 1) / 3); } // 0 low, 1 mid, 2 high

// Anti-entropic NFA: reject a sliding window of 3 whose bands are all
// different. State keeps the previous two cells' bands.
const antiEntropicSpec = NFA.encodeSpec({
  startState: { prev2: null, prev1: null },
  transition: ({ prev2, prev1 }, value) => {
    const band = bandOf(value);
    if (prev2 !== null && band !== prev1 && band !== prev2 && prev1 !== prev2) {
      return undefined; // one low, one mid, one high -- forbidden on a blue line
    }
    return { prev2: prev1, prev1: band };
  },
  accept: () => true,
}, 9);

return [
  new Shape('9x9'),

  new Given('R8C7', 8),

  ...beigeLines.map(cells => new Entropic(...cells)),
  ...blueLines.map(cells => new NFA(antiEntropicSpec, 'antiLMH', ...cells)),

  ...indexConstraints,
];
