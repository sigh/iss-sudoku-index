// Title: Hells Bells
// Author: Christounet
// Video: https://www.youtube.com/watch?v=RLNlZluaecM
// Source: https://app.crackingthecryptic.com/sudoku/nTJ3njPR6r

// Normalish sudoku: digits 0-9 once per row, column and box; one cell per
// house is a Schrodinger cell (S-cell) holding two digits. A cell's value is
// its single digit, or the sum of its two digits when it is the S-cell.
// White circles: every value written in a circle (repeated digits mean
// repeated occurrences) must appear that many times among its 4 surrounding
// cells -- the rules' own example: R89C67 is "666" and needs value 6 in at
// least 3 of its 4 cells.
// Blue lines: values on a line sum to an equal total N within each box the
// line passes through; a re-entry into an already-visited box sums that
// segment separately; different lines may use different N.

const shape = new Shape('9x9', '0-15');
const SENTINEL = 10;
const graph = cellGraph(shape);
const cells = graph.cells();
const VS = graph.makeOverlay('VS');
const VH = graph.makeOverlay('VH');
const VL = graph.makeOverlay('VL');
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// Each house scans primary, second, primary, second, ... and must see every
// digit 0-9 exactly once, forcing one non-sentinel second digit per house.
const houseSpec = NFA.encodeSpec({
  startState: { mask: 0, second: false },
  transition: (s, x) => {
    if (!s.second) {
      if (x > 9) return undefined;
      const bit = 1 << x;
      return s.mask & bit ? undefined : { mask: s.mask | bit, second: true };
    }
    if (x === SENTINEL) return { mask: s.mask, second: false };
    if (x > 9) return undefined;
    const bit = 1 << x;
    return s.mask & bit ? undefined : { mask: s.mask | bit, second: false };
  },
  accept: s => !s.second && s.mask === 1023,
}, shape);

// Ties a cell's stored digit(s) to its value, split as 9*VH + VL so both
// overlays stay inside the shape's 16-value cap (a value can reach 17).
const valueSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x <= 9 ? { k: 1, a: x } : undefined;
    if (s.k === 1) return x === SENTINEL || x <= 9
      ? { k: 2, value: x === SENTINEL ? s.a : s.a + x } : undefined;
    if (s.k === 2) return x <= 1 ? { k: 3, value: s.value, high: x } : undefined;
    if (s.k === 3) return x === s.value - 9 * s.high ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, shape);

// A two-digit cell is unordered; canonicalize to remove the artificial
// digit-order symmetry the encoding introduces (which digit is "primary").
const canonicalPair = Pair.fnToKey((a, b) => b === SENTINEL || b < a, shape);

const houses = graph.rowsColumnsBoxes().map((house, i) =>
  new NFA(houseSpec, `schrodinger-house-${i + 1}`,
    ...house.flatMap(cell => [cell, VS.at(cell)])));
const valueTies = cells.map(cell =>
  new NFA(valueSpec, 'cell-value', cell, VS.at(cell), VH.at(cell), VL.at(cell)));
const canonicalPairs = cells.map(cell =>
  new Pair(canonicalPair, 'canonical-pair', cell, VS.at(cell)));

// White circles: reads (grid, second-digit) pairs for the 4 surrounding
// cells and counts how many have value === target; accepts once that count
// reaches minCount.
const circleSpec = (target, minCount) => NFA.encodeSpec({
  startState: { half: 0, count: 0 },
  transition: (s, x) => {
    if (s.half === 0) return x <= 9 ? { half: 1, g: x, count: s.count } : undefined;
    const value = x === SENTINEL ? s.g : s.g + x;
    // Clamp: once count reaches minCount the clue is already satisfied.
    return { half: 0, count: Math.min(s.count + (value === target ? 1 : 0), minCount) };
  },
  accept: s => s.half === 0 && s.count >= minCount,
  maxDepth: 8, // 4 cells x (grid, second-digit)
}, shape);
// Corner coordinates from the drawn overlays; digit repeats in the source
// text ("666") set minCount, per the rules' own worked example.
const CIRCLES = [
  { cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'], target: 6, min: 1 }, // corner(R1C1,R1C2,R2C1,R2C2) text "6"
  { cells: ['R1C4', 'R1C5', 'R2C4', 'R2C5'], target: 6, min: 1 }, // corner(R1C4,R1C5,R2C4,R2C5) text "6"
  { cells: ['R1C8', 'R1C9', 'R2C8', 'R2C9'], target: 6, min: 1 }, // corner(R1C8,R1C9,R2C8,R2C9) text "6"
  { cells: ['R8C6', 'R8C7', 'R9C6', 'R9C7'], target: 6, min: 3 }, // corner(R8C6,R8C7,R9C6,R9C7) text "666"
];
const circles = CIRCLES.map((c, i) =>
  new NFA(circleSpec(c.target, c.min), `circle-${i + 1}`,
    ...c.cells.flatMap(cell => [cell, VS.at(cell)])));

// Blue lines: equal-sum-per-box-segment. Each line below is its list of box
// segments in drawn walking order; consecutive segments' value-sums are
// equated, chaining every segment in a line to one shared N.
const valueTerms = (segCells, coefficient = 1) =>
  segCells.flatMap(cell => [[VH.at(cell), 9 * coefficient], [VL.at(cell), coefficient]]);
const equalSegments = segments => segments.slice(1).map((seg, i) =>
  new Sum(0, ...valueTerms(segments[i]), ...valueTerms(seg, -1)));

const LINES = {
  // raw lines[0]; matches the rules' own worked example verbatim
  // (r1c3+r2c3 = r1c4+r1c5+r1c6 = r1c7+r2c7).
  A: [['R2C3', 'R1C3'], ['R1C4', 'R1C5', 'R1C6'], ['R1C7', 'R2C7']],
  // raw lines[1]+lines[2]: a branching stroke that meets exactly at R2C5
  // (R2C4-R2C5 forks to R3C6 and into a loop back to R3C5). The loop's
  // final waypoint returns to R3C5, already in segment 1, so it opens no
  // further box segment.
  B: [
    ['R2C4', 'R2C5', 'R3C5', 'R3C6'],
    ['R4C4', 'R5C4'],
    ['R6C3'],
    ['R7C3'],
    ['R7C4', 'R7C5', 'R7C6'],
    ['R7C7'],
    ['R6C7'],
    ['R5C6', 'R4C6'],
  ],
  // raw lines[3]+lines[5]: a straight stroke split at its bend, meeting
  // exactly at R5C1 with no branch.
  D: [['R4C2', 'R5C1', 'R6C1'], ['R7C1']],
  E: [['R4C3', 'R5C3', 'R6C2'], ['R7C2']], // raw lines[4]
  F: [['R5C7', 'R6C8'], ['R7C8']], // raw lines[6]
  G: [['R5C8', 'R6C9'], ['R7C9']], // raw lines[7]
  H: [['R9C1', 'R9C2', 'R9C3'], ['R9C4']], // raw lines[8]
};
const blueLines = Object.values(LINES).flatMap(equalSegments);

return [
  shape,
  VS.toVar('second digit'), VH.toVar('value high'), VL.toVar('value low'),
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  VS.makeReplicate(new Given(VS.at(cells[0]), ...range(0, 10))),
  VH.makeReplicate(new Given(VH.at(cells[0]), 0, 1)),
  VL.makeReplicate(new Given(VL.at(cells[0]), ...range(0, 8)), VL.at(cells)),
  ...houses, ...valueTies, ...canonicalPairs,
  ...circles, ...blueLines,
];
