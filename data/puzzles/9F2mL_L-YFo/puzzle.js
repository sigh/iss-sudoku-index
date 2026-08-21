// Title: Genus 3
// Author: Jeet Sampat
// Video: https://www.youtube.com/watch?v=9F2mL_L-YFo
// Source: https://sudokupad.app/f0zxtm2lrs

// Rules encoded here:
//  1. Nine non-overlapping 3x3 regions are placed in the 11x11 grid, each
//     holding the digits 1-9 once each. Every cell outside all nine regions is
//     empty.
//  2. No digit repeats along a row or along a column; empty cells may repeat.
//  3. Digits on the grey thermometer strictly increase from its bulb end.
//  4. Each outside clue gives the sum of the digits along the diagonal its
//     arrow points down. Four clues are inequalities (<23, >17, >16, >32); the
//     other eight are expressions in the shared unknowns x, y and z and so
//     constrain one another.
// The fog and the reveal-on-correct-digit behaviour are presentation only and
// say nothing about the final grid. Nothing is omitted.
//
// The main grid is Raw rather than Sudoku: only 81 of the 121 cells hold a
// digit, while a Sudoku grid's rows and columns are all-different across the
// whole alphabet. Raw carries no implicit constraints, so every rule is stated
// here. Main grid values: 1-9 = the digit in this cell, 0 = this cell is empty.
const shape = new Shape('11x11', '0-9', 'Raw');
const grid = cellGraph(shape);
const geom = grid.gridGeometry();
const cells = grid.cells();
const BLANK = 0;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Two auxiliary whole-grid layers, each indexed by the grid cell it shadows.
const T = grid.makeOverlay('VT');  // 1 = a 3x3 region has its top-left corner here
const F = grid.makeOverlay('VF');  // 1 = this cell lies inside one of the regions
const flagDomain = overlay =>
  overlay.makeReplicate(new Given(overlay.cells()[0], 0, 1));

// A region's corner needs a whole 3x3 block below and right of it.
const cornerRoom = T.makeReplicate(
  new Given(T.cells()[0], 0),
  T.at(cells.filter(cell => grid.block(cell, 3, 3) === null)));

const filledKey = Pair.fnToKey((digit, flag) => (digit !== BLANK) === (flag === 1), geom);
const filled = cells.map(cell => new Pair(filledKey, 'filled', cell, F.at(cell)));

// A cell lies in a region exactly when one region corner sits in the 3x3 window
// that ends at that cell, and never more than one: the single equation is both
// the "cells inside a region are the filled ones" rule and the non-overlap rule.
const coverage = cells.map(cell => {
  const window = [];
  for (let dRow = -2; dRow <= 0; dRow++) {
    for (let dCol = -2; dCol <= 0; dCol++) {
      const corner = grid.step(cell, dRow, dCol);
      if (corner !== null) window.push(T.at(corner));
    }
  }
  // At R1C1 the window is that cell alone and the equation degenerates to
  // "R1C1 is filled exactly when a region starts there".
  return window.length === 1
    ? new SameValues(2, window[0], F.at(cell))
    : new EqualSum(window, [F.at(cell)]);
});

const regionCount = new Sum(9, ...T.cells());

// Where a region does start, its nine cells hold 1-9 once each.
const regionDigits = cells
  .filter(cell => grid.block(cell, 3, 3) !== null)
  .map(cell => new Or([
    new Given(T.at(cell), 0),
    new ContainExact(DIGITS.join('_'), ...grid.block(cell, 3, 3)),
  ]));

// One machine per row and column: a digit may not be seen twice, while the
// blank 0 may repeat freely. State = the set of digits seen so far.
const noRepeatSpec = NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => {
    if (value === BLANK) return seen;
    const bit = 1 << (value - 1);
    return (seen & bit) ? undefined : (seen | bit);
  },
  accept: () => true,
  maxDepth: cells.length / geom.numRows,
}, geom);
const houses = [...grid.rows(), ...grid.columns()].map(
  house => new NFA(noRepeatSpec, 'no-repeat', ...house));

// The single grey line, R3C4-R4C3 in drawn order, with the bulb marked at R4C3
// (the drawn path's last point), so the increasing direction is R4C3 -> R3C4.
// The rule speaks about the digits on the thermometer; the rules never say a
// thermometer cell must lie inside a region, so a blank end leaves it silent.
const thermoKey = Pair.fnToKey(
  (bulb, tip) => bulb === BLANK || tip === BLANK || bulb < tip, geom);
const thermo = new Pair(
  thermoKey, 'thermo-increase', makeCellId(4, 3), makeCellId(3, 4));

// The twelve outside clues, transcribed from the twelve drawn arrows: each
// arrow head touches the grid edge at a lattice corner and the diagonal is the
// ray leaving that corner in the arrow's own direction. The badge paired with
// each arrow is the one drawn against it.
// (Columns and rows past 9 are lettered in cell ids, so they are built rather
// than written out: R4C11 is "R4Cb".)
const ray = (row, col, dRow, dCol) => grid.ray(makeCellId(row, col), dRow, dCol);
const under23 = ray(1, 4, 1, -1);       // "<23",     R1C4 down-left to R4C1
const topXminus5 = ray(1, 7, 1, -1);    // "x-5",     R1C7 down-left to R7C1
const over17 = ray(1, 9, 1, -1);        // ">17",     R1C9 down-left to R9C1
const sixMinusZ = ray(4, 11, 1, -1);    // "6-z",     R4C11 down-left to R11C4
const clueY = ray(6, 11, -1, -1);       // "y",       R6C11 up-left to R1C6
const c131minus3x = ray(8, 11, -1, -1); // "131-3x",  R8C11 up-left to R1C4
const over16 = ray(11, 3, -1, 1);       // ">16",     R11C3 up-right to R3C11
const botXminus5 = ray(11, 5, -1, 1);   // "x-5",     R11C5 up-right to R5C11
const over32 = ray(11, 6, -1, 1);       // ">32",     R11C6 up-right to R6C11
const clueZ = ray(8, 1, -1, 1);         // "z",       R8C1 up-right to R1C8
const c52minusY = ray(6, 1, 1, 1);      // "52-y",    R6C1 down-right to R11C6
const xPlus5 = ray(4, 1, 1, 1);         // "x+5",     R4C1 down-right to R11C8

// An inequality clue as a running total whose state saturates at the bound:
// past the bound no further digit can bring the total back, so the machine
// stays small. cap is the first total that need not be tracked exactly.
const sumBound = (name, cells, min, max) => {
  const cap = max === null ? min : max + 1;
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => Math.min(cap, sum + value),
    accept: sum => sum >= min && (max === null || sum <= max),
    maxDepth: cells.length,
  }, geom);
  return new NFA(spec, name, ...cells);
};
const inequalities = [
  sumBound('under-23', under23, 0, 22),
  sumBound('over-17', over17, 18, null),
  sumBound('over-16', over16, 17, null),
  sumBound('over-32', over32, 33, null),
];

// The eight algebraic clues say only that some x, y, z exist with
// x-5 = sum(topXminus5) = sum(botXminus5), x+5 = sum(xPlus5),
// 131-3x = sum(c131minus3x), y = sum(clueY), 52-y = sum(c52minusY),
// z = sum(clueZ), 6-z = sum(sixMinusZ). Eliminating the three unknowns (take
// x = sum(topXminus5)+5, y = sum(clueY), z = sum(clueZ)) leaves exactly these
// five equations, which is the whole content of the eight clues.
const algebraic = [
  // both x-5 diagonals hold the same total
  new EqualSum(topXminus5, botXminus5),
  // x+5 is 10 more than x-5
  new Sum(10, ...xPlus5, ...topXminus5.map(cell => [cell, -1])),
  // (131-3x) + 3*(x-5) = 116
  new Sum(116, ...c131minus3x, ...topXminus5.map(cell => [cell, 3])),
  // y + (52-y) = 52
  new Sum(52, ...clueY, ...c52minusY),
  // z + (6-z) = 6
  new Sum(6, ...clueZ, ...sixMinusZ),
];

return [
  shape,
  T.toVar('T'), F.toVar('F'),
  flagDomain(T), flagDomain(F), cornerRoom,
  ...filled, ...coverage, regionCount, ...regionDigits,
  ...houses, thermo,
  ...inequalities, ...algebraic,
];
