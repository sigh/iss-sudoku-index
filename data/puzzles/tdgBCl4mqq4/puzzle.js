// Title: The Graveyard Of Schrodinger
// Author: fjam
// Video: https://www.youtube.com/watch?v=tdgBCl4mqq4
// Source: https://app.crackingthecryptic.com/sudoku/3FJJtfL2Dh

// Rules encoded here:
//  1. Place the digits 0-9 so each digit appears once in every row, column and
//     3x3 box. One cell in each row, column and box is a Schrodinger cell
//     holding two digits; every other cell holds one. (Nine cells, nine digits
//     plus one doubled-up cell, makes ten digits per house.)
//  2. Each grave (cage) carries a date DD/MM/YY. The digits in a grave sum to
//     the day, the month or the year of that date.
//  3. Digits cannot repeat within a grave.
//  4. An orthogonally connected path runs between the green cell R1C1 and the
//     red cell R9C9.
//  5. The path may not cross the highest or the lowest digit in a grave.
// Nothing is omitted.

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const NONE = 10;                // second-digit layer: this cell holds one digit
const CLEAR = 0, BARRIER = 1;   // barrier layer
const OFF = 0, ON = 1;          // route layer

// Ten digits need an alphabet of ten, and the second-digit layer needs one more
// value for "no second digit", so the shape carries 0-10 and the grid cells are
// pinned back to 0-9 below.
const shape = new Shape('9x9', '0-10');
const graph = cellGraph(shape);

// One digit of every cell lives in the grid; a Schrodinger cell's other digit
// lives on VS, which holds NONE everywhere else.
const second = graph.makeOverlay('VS');
// VB marks a cell that holds the highest or the lowest digit of its grave --
// rule 5's barriers. VR marks the cells the escape route reaches.
const barrier = graph.makeOverlay('VB');
const route = graph.makeOverlay('VR');

// The 24 graves, transcribed from the cage labels drawn on the grid: the date
// printed on each grave followed by the cells it covers.
const GRAVES = [
  ['13/02/20', 'R1C2', 'R1C3'],
  ['15/11/20', 'R1C4', 'R1C5', 'R1C6'],
  ['11/07/23', 'R1C7', 'R1C8', 'R1C9'],
  ['14/01/23', 'R2C1', 'R3C1'],
  ['31/08/30', 'R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ['16/07/18', 'R2C4', 'R3C4'],
  ['12/09/27', 'R2C5', 'R2C6', 'R3C5', 'R3C6'],
  ['16/10/14', 'R2C7', 'R3C7'],
  ['12/10/22', 'R2C8', 'R3C8', 'R4C8'],
  ['23/11/17', 'R2C9', 'R3C9', 'R4C9', 'R5C8', 'R5C9'],
  ['26/12/29', 'R4C1', 'R5C1', 'R5C2', 'R5C3', 'R6C3'],
  ['02/04/24', 'R4C2', 'R4C3'],
  ['22/03/20', 'R4C4', 'R5C4', 'R6C4'],
  ['07/08/16', 'R4C5', 'R5C5'],
  ['13/05/10', 'R4C6', 'R5C6'],
  ['27/12/21', 'R4C7', 'R5C7', 'R6C6', 'R6C7', 'R6C8'],
  ['20/11/34', 'R6C1', 'R6C2', 'R7C1', 'R7C2'],
  ['29/12/33', 'R6C5', 'R7C5', 'R7C6', 'R8C5', 'R8C6'],
  ['16/06/24', 'R6C9', 'R7C9', 'R8C9'],
  ['19/12/14', 'R7C3', 'R8C3', 'R9C3'],
  ['08/10/13', 'R7C4', 'R8C4', 'R9C4', 'R9C5'],
  ['14/11/19', 'R7C7', 'R7C8', 'R8C7', 'R8C8'],
  ['18/12/27', 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  ['19/10/17', 'R9C6', 'R9C7', 'R9C8'],
];

// The green and red cells (R1C1, R9C9) are the two cells no grave covers.
const GREEN = 'R1C1', RED = 'R9C9';

// Each grave's highest and lowest digit, which rule 5 turns into barriers.
const graveHigh = new Var('H', 'grave highest digit', GRAVES.length);
const graveLow = new Var('L', 'grave lowest digit', GRAVES.length);

// A grave's three candidate totals: the day, month and year of its date.
const graveTargets = date => date.split('/').map(Number);

// Rule 1, per house: nine grid cells and their nine second-digit cells hold
// each of 0-9 exactly once, and NONE eight times -- so exactly one of the nine
// cells carries a second digit, and the ten digits it takes to fill the house
// are all present.
const HOUSE_MULTISET = [...DIGITS, ...Array(8).fill(NONE)].join('_');

// Rules 2 and 3 read a grave as the flat digit sequence [digit, second, ...],
// where NONE contributes nothing.
const graveDigitCells = cells =>
  cells.flatMap(cell => [cell, second.at(cell)]);

// Rule 3: state is the bitmask of digits already seen in the grave.
const noRepeatInGrave = NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => {
    if (value === NONE) return seen;
    const bit = 1 << value;
    return (seen & bit) ? undefined : (seen | bit);
  },
  accept: () => true,
}, shape);

// Rule 2: state is the running total, abandoned once it passes the largest of
// the grave's three candidate totals.
const graveTotalNFA = targets => {
  const limit = Math.max(...targets);
  return NFA.encodeSpec({
    startState: 0,
    transition: (total, value) => {
      if (value === NONE) return total;
      const next = total + value;
      return next > limit ? undefined : next;
    },
    accept: total => targets.includes(total),
  }, shape);
};

// Rule 5 in one machine per grave, over
// [high, low, digit, second, barrier, digit, second, barrier, ...].
// Reading the claimed extremes first lets a single pass both check them (no
// digit outside [low, high], and both endpoints actually occur) and decide each
// cell's barrier flag: a cell is a barrier exactly when one of its one or two
// digits is the grave's high or low digit.
const graveExtremes = NFA.encodeSpec({
  startState: { stage: 'high' },
  transition: (s, value) => {
    switch (s.stage) {
      case 'high':
        if (value === NONE) return undefined;
        return { stage: 'low', hi: value };
      case 'low':
        if (value === NONE || value > s.hi) return undefined;
        return {
          stage: 'digit', hi: s.hi, lo: value, sawHi: false, sawLo: false,
        };
      case 'digit':
        if (value > s.hi || value < s.lo) return undefined;
        return {
          stage: 'second', hi: s.hi, lo: s.lo,
          sawHi: s.sawHi || value === s.hi,
          sawLo: s.sawLo || value === s.lo,
          hit: value === s.hi || value === s.lo,
        };
      case 'second':
        if (value === NONE) {
          return {
            stage: 'flag', hi: s.hi, lo: s.lo,
            sawHi: s.sawHi, sawLo: s.sawLo, hit: s.hit,
          };
        }
        if (value > s.hi || value < s.lo) return undefined;
        return {
          stage: 'flag', hi: s.hi, lo: s.lo,
          sawHi: s.sawHi || value === s.hi,
          sawLo: s.sawLo || value === s.lo,
          hit: s.hit || value === s.hi || value === s.lo,
        };
      case 'flag':
        if (value !== (s.hit ? BARRIER : CLEAR)) return undefined;
        return {
          stage: 'digit', hi: s.hi, lo: s.lo, sawHi: s.sawHi, sawLo: s.sawLo,
        };
    }
    return undefined;
  },
  accept: s => s.stage === 'digit' && s.sawHi && s.sawLo,
}, shape);

// Rule 4. The route layer is not the drawn path but the whole set of cells the
// green cell can reach without crossing a barrier: one machine per orthogonally
// adjacent pair, over [route(a), barrier(a), route(b), barrier(b)], forbids a
// reached cell from sitting next to an unreached barrier-free cell. With the
// connectivity constraint below and the green cell pinned ON, that fixes VR as
// green's reachable region, and pinning the red cell ON is then exactly "a path
// between green and red exists".
const routeIsMaximal = NFA.encodeSpec({
  startState: { stage: 0 },
  transition: (s, value) => {
    if (value !== 0 && value !== 1) return undefined;
    switch (s.stage) {
      case 0: return { stage: 1, ra: value };
      case 1: return { stage: 2, ra: s.ra, ba: value };
      case 2: return { stage: 3, ra: s.ra, ba: s.ba, rb: value };
      case 3:
        if (s.ra === ON && s.rb === OFF && value === CLEAR) return undefined;
        if (s.rb === ON && s.ra === OFF && s.ba === CLEAR) return undefined;
        return { stage: 4 };
    }
    return undefined;
  },
  accept: s => s.stage === 4,
}, shape);

const adjacentPairs = graph.cells().flatMap(
  cell => graph.neighbours(cell)
    .filter(other => other > cell)
    .map(other => [cell, other]));

const graveCells = new Set(GRAVES.flatMap(([, ...cells]) => cells));

return [
  shape,
  second.toVar('second digit of a Schrodinger cell'),
  barrier.toVar('holds its grave highest or lowest digit'),
  route.toVar('reachable from the green cell'),
  graveHigh,
  graveLow,

  // Grid cells hold a digit; NONE is only ever a second-digit-layer value.
  graph.makeReplicate(new Given(GREEN, ...DIGITS)),
  barrier.makeReplicate(new Given(barrier.at(GREEN), CLEAR, BARRIER)),
  route.makeReplicate(new Given(route.at(GREEN), OFF, ON)),
  ...graveHigh.cells().map(cell => new Given(cell, ...DIGITS)),
  ...graveLow.cells().map(cell => new Given(cell, ...DIGITS)),

  // Rule 1.
  ...graph.rowsColumnsBoxes().map(cells =>
    new ContainExact(HOUSE_MULTISET, ...cells, ...second.at(cells))),

  // A Schrodinger cell's two digits are interchangeable between the grid and
  // the VS layer, which is an artifact of splitting them across two layers and
  // not something the puzzle distinguishes. Keep the smaller digit in the grid
  // so each answer has one representation.
  ...graph.cells().map(cell => new Pair(
    Pair.fnToKey((d, s) => s === NONE || d < s, shape),
    'grid holds the smaller digit', cell, second.at(cell))),

  // Rules 2 and 3.
  ...GRAVES.map(([date, ...cells]) =>
    new NFA(graveTotalNFA(graveTargets(date)), `grave ${date} total`,
      ...graveDigitCells(cells))),
  ...GRAVES.map(([date, ...cells]) =>
    new NFA(noRepeatInGrave, `grave ${date} digits differ`,
      ...graveDigitCells(cells))),

  // Rule 5: extremes, and the barrier flag they imply for each grave cell.
  ...GRAVES.map(([date, ...cells], i) =>
    new NFA(graveExtremes, `grave ${date} extremes`,
      graveHigh.cell(i + 1), graveLow.cell(i + 1),
      ...cells.flatMap(
        cell => [cell, second.at(cell), barrier.at(cell)]))),
  // A cell in no grave has no grave extreme to hold.
  ...graph.cells().filter(cell => !graveCells.has(cell)).map(
    cell => new Given(barrier.at(cell), CLEAR)),

  // Rule 4.
  new Given(route.at(GREEN), ON),
  new Given(route.at(RED), ON),
  ...graph.cells().map(cell => new Pair(
    Pair.fnToKey((r, b) => r === OFF || b === CLEAR, shape),
    'route clear of barriers', route.at(cell), barrier.at(cell))),
  ...adjacentPairs.map(([a, b]) => new NFA(routeIsMaximal, 'route is maximal',
    route.at(a), barrier.at(a), route.at(b), barrier.at(b))),
  new ConnectedValues('VR', ON),
];
