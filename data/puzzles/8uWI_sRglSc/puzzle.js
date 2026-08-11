// Title: Bicycles
// Author: SirSchmoopy
// Video: https://www.youtube.com/watch?v=8uWI_sRglSc
// Source: https://app.crackingthecryptic.com/sudoku/rRJ2Tq4b6f

// Normal sudoku rules apply. R7C2-R7C3 is a cage summing to 15 (the
// payload's own "cages" array names it a cage; confined to one row, so
// sudoku already forbids repeats -- Cage's uniqueness clause is redundant
// here but harmless). Six thermometers increase from their bulb (Thermo
// takes the bulb first). The off-grid "23" clue pairs with the down-right
// arrow entering at R1C4 (nearest-distance pairing; the label itself
// renders one column left of the cell it anchors to) and gives the sum of
// the 6-cell diagonal R1C4-R2C5-R3C6-R4C7-R5C8-R6C9; the rules state only a
// sum, no uniqueness, so this is Sum rather than Cage.
//
// Cycle-order rule: within a row, treat its digits as a permutation pi
// (column -> digit, both 1-9). Starting a chase at a thermometer cell's own
// column X: X -> pi(X) -> pi(pi(X)) -> ... returns to X after k steps,
// where k (the "order") must strictly increase along every thermometer,
// bulb to tip. ValueIndexing(valueCell, controlCell, ...indexedCells)
// enforces valueCell == indexedCells[controlCell] (1-indexed, a row-scoped
// array dereference) rather than the arrow-distance genre its own
// DESCRIPTION names -- checked against the handler with a small
// accept/reject fixture. Chaining it up to 8 times per thermometer cell
// computes that cell's chase sequence; one Or over the 9 candidate return
// lengths k=1..9 then reads off the *minimal* k (a permutation cycle of
// true order k also returns at every further multiple of k, so branch k
// additionally requires the first k chase values pairwise distinct --
// otherwise a non-minimal k could also satisfy "returns to the start").
// The chase (VCH) and order (VORD) aux cells are fully pinned by these
// constraints in every case, never left free.

const shape = new Shape('9x9');

const rowCells = (r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c));

// One (row, startColumn) cycle-order gadget: chases pi from startCol into
// chaseVar's gadgetIndex-th row (8 cells, chase steps 2..9 -- step 1 is the
// real grid cell at (r, startCol)), then selects the minimal return length
// into orderVar's gadgetIndex-th cell.
function cycleOrderGadget(gadgetIndex, r, startCol, chaseVar, orderVar) {
  const cells = rowCells(r);
  const chase = [
    makeCellId(r, startCol),
    ...Array.from({ length: 8 }, (_, i) => chaseVar.cell(gadgetIndex, i + 1)),
  ];
  const steps = chase.slice(1).map(
    (cell, i) => new ValueIndexing(cell, chase[i], ...cells));
  const orderCell = orderVar.cell(gadgetIndex);
  const branches = Array.from({ length: 9 }, (_, i) => {
    const k = i + 1;
    return new And([
      new Given(chase[k - 1], startCol),
      ...(k > 1 ? [new AllDifferent(...chase.slice(0, k))] : []),
      new Given(orderCell, k),
    ]);
  });
  return { stepConstraints: [...steps, new Or(branches)], orderCell };
}

// The six thermometers, bulb first (same cells as the Thermo constraints
// below, drawn from the payload's own bulb-circle underlays), as
// [row, col] pairs.
const THERMOMETERS = [
  [[8, 1], [7, 1], [6, 1], [5, 1], [4, 1], [3, 1], [2, 1]],
  [[4, 5], [3, 5]],
  [[6, 5], [5, 5]],
  [[2, 8], [1, 8]],
  [[3, 9], [4, 9], [5, 9], [6, 9]],
  [[8, 8], [9, 8]],
];

const flatPositions = THERMOMETERS.flatMap(t => t);
const chaseVar = new Var('CH', 'cycle chase steps', `${flatPositions.length}x8`);
const orderVar = new Var('ORD', 'cycle order', flatPositions.length);
const gadgets = flatPositions.map(
  ([r, c], i) => cycleOrderGadget(i + 1, r, c, chaseVar, orderVar));

// Regroup the flat gadget list back into per-thermometer order, matching
// THERMOMETERS' own grouping (flatPositions preserves that order).
const thermoGadgetGroups = THERMOMETERS.reduce((acc, t) => ({
  consumed: acc.consumed + t.length,
  groups: [...acc.groups, gadgets.slice(acc.consumed, acc.consumed + t.length)],
}), { consumed: 0, groups: [] }).groups;

// Strict increase of cycle order along each thermometer, bulb to tip --
// reusing Thermo itself (its own semantics are exactly "increasing from
// the first cell") over the order cells instead of the digit cells.
const orderIncreases = thermoGadgetGroups.map(
  group => new Thermo(...group.map(g => g.orderCell)));

return [
  shape,
  chaseVar,
  orderVar,

  new Given(makeCellId(1, 1), 1),
  new Given(makeCellId(7, 5), 1),

  new Cage(15, makeCellId(7, 2), makeCellId(7, 3)),

  ...THERMOMETERS.map(t => new Thermo(...t.map(([r, c]) => makeCellId(r, c)))),

  new Sum(23,
    makeCellId(1, 4), makeCellId(2, 5), makeCellId(3, 6),
    makeCellId(4, 7), makeCellId(5, 8), makeCellId(6, 9)),

  ...gadgets.flatMap(g => g.stepConstraints),
  ...orderIncreases,
];
