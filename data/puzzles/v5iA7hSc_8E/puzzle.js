// Title: Careful with that hook, Emmett
// Author: Christounet
// Video: https://www.youtube.com/watch?v=v5iA7hSc_8E
// Source: https://app.crackingthecryptic.com/sudoku/qh6TFtgTfd

// Digits 0-9 once per row, column, box and the marked diagonal (10 digits
// over 9 cells): one cell per house is a Schrodinger cell (S-cell) holding
// two digits. The rules state a narrow "value" rule: "If an S-cell is on
// any arrow/arrow circle, cage or blue line, its value is the sum of the
// S-Cell's 2 digits" -- naming exactly those three clue kinds. Every other
// clue below (diagonal, purple line, white circles, thermometer) is
// therefore read as operating on the S-cell's two digits directly (as two
// separate members), never their sum.
// Purple line: digits on the line form a non-repeating consecutive set; an
// S-cell on it contributes both its digits as members of that set.
// Grey arrow: shaft digits sum to the bulb cell's value (bulb is a grid
// cell, not a printed number).
// Orange circles/line: sum of the two circled cells' values equals the sum
// of the line's interior cells' values (see the Sum(0,...) comment below
// for why the circled cells are excluded from "along the line").
// Blue line: values have an equal sum N within each box it crosses (one
// line here, crossing exactly two boxes).
// Cages: sum to the corner total (both are single-cell cages here).
// White circles: each digit character drawn in a circle (repeats count
// separately) must appear -- as a digit held by a cell, not a summed value
// -- at least once among the circle's 4 surrounding cells.
// Thermometer: increases from the bulb; an S-cell on it is read as both its
// digits independently increasing (min digit exceeds the previous cell's
// max, max digit is exceeded by the next cell's min), since no "value" is
// defined for it.

const SENTINEL = 10; // one above the top digit (9): "no second digit".
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const shape = new Shape('9x9', '0-15'); // wide enough for VS's sentinel (10)
// and the split value overlay VH/VL (below); playable cells are restricted
// back to their true ranges via the Givens near the bottom.
const graph = cellGraph(shape);
const cells = graph.cells();
const VS = graph.makeOverlay('VS'); // second Schrodinger digit, or SENTINEL

// Cells that ever need a "value" (single digit, or sum for an S-cell): the
// two cages, both arrows (bulb + shaft), the blue line, and the orange
// circles/line. Scoping VH/VL to just these keeps the encoding small.
const CAGE_CELLS = ['R8C4', 'R8C5'];
const ARROW0 = { bulb: 'R5C1', shaft: ['R4C2', 'R3C3'] };
const ARROW1 = { bulb: 'R1C5', shaft: ['R2C4', 'R3C3'] };
const BLUE_SEG1 = ['R9C5', 'R9C6', 'R8C6', 'R7C5', 'R7C4'];
const BLUE_SEG2 = ['R8C3', 'R8C2', 'R9C1', 'R9C2', 'R9C3'];
const ORANGE_CIRCLES = ['R9C9', 'R8C6'];
const ORANGE_LINE_INTERIOR = ['R9C8', 'R9C7'];
const VALUE_CELLS = [...new Set([
  ...CAGE_CELLS, ARROW0.bulb, ...ARROW0.shaft, ARROW1.bulb, ...ARROW1.shaft,
  ...BLUE_SEG1, ...BLUE_SEG2, ...ORANGE_CIRCLES, ...ORANGE_LINE_INTERIOR,
])];
const VH = graph.makeOverlay('VH', VALUE_CELLS); // value = 9*VH + VL
const VL = graph.makeOverlay('VL', VALUE_CELLS); // (value can reach 17)

// Each house (row/column/box/diagonal) scans primary, second, primary,
// second, ... and must see every digit 0-9 exactly once, forcing exactly
// one non-sentinel second digit per house -- the Schrodinger cell -- by
// pigeonhole.
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

// Ties a value cell's stored digit(s) to its value, split as 9*VH + VL so
// both overlays stay inside the shape's 16-value cap.
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

// A two-digit cell is an unordered pair; this removes only the artificial
// digit-order symmetry between the grid digit and VS.
const canonicalPair = Pair.fnToKey((a, b) => b === SENTINEL || b < a, shape);

// Purple line: collects every digit seen (primary always; second only when
// present) into a bitmask, rejecting a repeat, then requires the final
// bitmask's set bits to be one contiguous run -- the "non-repeating
// consecutive set" rule, sized L or L+1 depending on whether an S-cell (2
// members) sits on the line.
const consecutiveSetSpec = NFA.encodeSpec({
  startState: { mask: 0 },
  transition: (s, x) => {
    if (x === SENTINEL) return s;
    if (x > 9) return undefined;
    const bit = 1 << x;
    return s.mask & bit ? undefined : { mask: s.mask | bit };
  },
  accept: s => {
    if (s.mask === 0) return false;
    let lo = 0; while (!((s.mask >> lo) & 1)) lo++;
    let hi = 9; while (!((s.mask >> hi) & 1)) hi--;
    return s.mask === (((1 << (hi - lo + 1)) - 1) << lo);
  },
}, shape);

// Thermometer: no "value" is defined for it (excluded from the value rule),
// so every digit at a cell -- one, or both for an S-cell -- must lie past
// the previous cell's largest digit: tracks the running max and requires
// the next cell's smallest digit to exceed it.
const thermoSpec = NFA.encodeSpec({
  startState: { phase: 0, prevMax: -1 },
  transition: (s, x) => {
    if (s.phase === 0) return x <= 9 ? { phase: 1, prevMax: s.prevMax, primary: x } : undefined;
    if (x > 9 && x !== SENTINEL) return undefined;
    const has2 = x !== SENTINEL;
    const lo = has2 ? Math.min(s.primary, x) : s.primary;
    const hi = has2 ? Math.max(s.primary, x) : s.primary;
    return lo > s.prevMax ? { phase: 0, prevMax: hi } : undefined;
  },
  accept: s => s.phase === 0,
}, shape);

// White circle: whether `target` is one of a cell's one or two digits,
// counted (clamped at minCount) across the 4 surrounding cells.
const circleSpec = (target, minCount) => NFA.encodeSpec({
  startState: { half: 0, count: 0 },
  transition: (s, x) => {
    if (s.half === 0) return x <= 9 ? { half: 1, g: x, count: s.count } : undefined;
    if (x > 9 && x !== SENTINEL) return undefined;
    const hit = s.g === target || x === target;
    return { half: 0, count: Math.min(s.count + (hit ? 1 : 0), minCount) };
  },
  accept: s => s.half === 0 && s.count >= minCount,
  maxDepth: 8, // 4 cells x (grid, second-digit)
}, shape);

// Provenance: diagonal is line #9 (deepskyblue), R1C1-R9C9.
const DIAGONAL = range(1, 9).map(i => makeCellId(i, i));
const houses = graph.rowsColumnsBoxes().map((house, i) =>
  new NFA(houseSpec, `schrodinger-house-${i + 1}`, ...house.flatMap(cell => [cell, VS.at(cell)])));
const diagonalHouse = new NFA(houseSpec, 'schrodinger-house-diagonal',
  ...DIAGONAL.flatMap(cell => [cell, VS.at(cell)]));
const canonicalPairs = cells.map(cell => new Pair(canonicalPair, 'canonical-pair', cell, VS.at(cell)));
const valueTies = VALUE_CELLS.map(cell =>
  new NFA(valueSpec, 'value-cell', cell, VS.at(cell), VH.at(cell), VL.at(cell)));

// Provenance: purple (#D23BE7) lines. P1 is raw lines[4] (isolated). P2 is
// the connected union of raw lines[5-8] (a branch-free chain).
const PURPLE1 = ['R9C5', 'R9C4', 'R9C3'];
const PURPLE2 = ['R1C5', 'R2C6', 'R3C6', 'R4C7', 'R3C8'];
const purpleLines = [PURPLE1, PURPLE2].map(line =>
  new NFA(consecutiveSetSpec, 'purple-line-consecutive-set', ...line.flatMap(cell => [cell, VS.at(cell)])));

// Provenance: thermometer is line #0 (grey, th=21); its bulb underlay sits
// at R8C8, the path's first cell.
const THERMO = ['R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R4C3', 'R3C2', 'R2C3', 'R3C4'];
const thermo = new NFA(thermoSpec, 'thermometer-increase', ...THERMO.flatMap(cell => [cell, VS.at(cell)]));

// Provenance: 4 white circles (black-bordered, corner-anchored) with their
// drawn digit text (overlays #8-11), each paired with the black circle
// overlay (#2,#3,#6,#7) at the same corner.
const CIRCLES = [
  { cells: ['R1C7', 'R1C8', 'R2C7', 'R2C8'], text: '10' }, // corner(R1C7,R1C8,R2C7,R2C8)
  { cells: ['R2C8', 'R2C9', 'R3C8', 'R3C9'], text: '04' }, // corner(R2C8,R2C9,R3C8,R3C9)
  { cells: ['R3C1', 'R3C2', 'R4C1', 'R4C2'], text: '19' }, // corner(R3C1,R3C2,R4C1,R4C2)
  { cells: ['R6C1', 'R6C2', 'R7C1', 'R7C2'], text: '55' }, // corner(R6C1,R6C2,R7C1,R7C2)
];
// A repeated digit character in the text is a separately-drawn digit that
// must independently "appear at least once", so it raises that digit's
// required count (e.g. "55" -> digit 5 needs 2 occurrences).
const circleTargets = text => {
  const counts = new Map();
  for (const ch of text) counts.set(+ch, (counts.get(+ch) ?? 0) + 1);
  return [...counts.entries()];
};
const circles = CIRCLES.flatMap(c => circleTargets(c.text).map(([target, minCount]) =>
  new NFA(circleSpec(target, minCount), `circle-${target}-${minCount}`,
    ...c.cells.flatMap(cell => [cell, VS.at(cell)]))));

// Arrow/cage/blue-line/orange-line value sums, all via the shared VH/VL split.
const valueTerms = (cellList, coeff = 1) => cellList.flatMap(cell => [[VH.at(cell), 9 * coeff], [VL.at(cell), coeff]]);
const arrows = [ARROW0, ARROW1].map(a =>
  new Sum(0, ...valueTerms(a.shaft, 1), ...valueTerms([a.bulb], -1)));
const cages = CAGE_CELLS.map(cell => new Sum(8, ...valueTerms([cell])));
const blueLine = new Sum(0, ...valueTerms(BLUE_SEG1, 1), ...valueTerms(BLUE_SEG2, -1));
// Orange circles sit at the line's own two endpoints (R9C9, R8C6); reading
// them as part of "along the line" would force the two interior cells'
// values to sum to 0, impossible for two distinct same-row cells (only one
// 0 per row, and an S-cell's value is a sum of two distinct digits, never
// 0) -- so the line's own value-sum excludes its circled endpoints, the
// same convention as an arrow's bulb.
const orangeLine = new Sum(0, ...valueTerms(ORANGE_CIRCLES, 1), ...valueTerms(ORANGE_LINE_INTERIOR, -1));

return [
  shape,
  VS.toVar('second Schrodinger digit'),
  VH.toVar('value (high, base 9)'),
  VL.toVar('value (low, base 9)'),
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  VS.makeReplicate(new Given(VS.at(cells[0]), ...range(0, 10))),
  VH.makeReplicate(new Given(VH.at(VALUE_CELLS[0]), 0, 1)),
  VL.makeReplicate(new Given(VL.at(VALUE_CELLS[0]), ...range(0, 8))),
  ...houses, diagonalHouse,
  ...canonicalPairs,
  ...valueTies,
  ...purpleLines,
  thermo,
  ...circles,
  ...arrows,
  ...cages,
  blueLine,
  orangeLine,
];
