// Title: Exponentially Bounded Thermos
// Author: Amin Khalek
// Video: https://www.youtube.com/watch?v=BCgUKEQD420
// Source: https://app.crackingthecryptic.com/8u7avt009b

// Rules encoded here, in full:
//   * Normal sudoku rules apply.
//   * Normal thermo rules do NOT apply: nothing makes the digits along a grey
//     line increase, so no Thermo constraint appears below.
//   * Each grey line is cut into at least two consecutive numbers, each
//     possibly multi-digit, with the unit digit towards the tip. Reading from
//     the bulb, each number is at least double and at most triple the one
//     before it.
//   * A cell holding an arrow that points at an adjacent grey-line cell holds
//     the digit count of the number that cell belongs to.
//   * In cages, digits sum to the clue in the top left corner.
// Nothing is omitted.

const shape = new Shape('9x9');

// The eleven grey lines, each listed bulb-end first: every line carries one
// shaded circle and that circle is its bulb. Two of them are only two cells
// long (R2C4-R1C5, R4C2-R5C1).
const thermoLines = [
  ['R8C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'],
  ['R8C7', 'R7C6', 'R6C5', 'R6C4', 'R5C3', 'R4C3', 'R3C2'],
  ['R7C8', 'R6C7', 'R5C6', 'R4C6', 'R3C5', 'R3C4', 'R2C3'],
  ['R6C9', 'R5C8', 'R4C7', 'R3C6'],
  ['R9C6', 'R8C5', 'R7C4', 'R6C3'],
  ['R7C1', 'R8C1', 'R9C1', 'R8C2'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C8'],
  ['R7C2', 'R6C2', 'R5C2', 'R4C1', 'R3C1'],
  ['R2C7', 'R2C6', 'R2C5', 'R1C4', 'R1C3'],
  ['R2C4', 'R1C5'],
  ['R4C2', 'R5C1'],
];

// The seven black arrow glyphs: [cell the arrow is drawn in, the orthogonally
// adjacent grey-line cell its head points at].
const arrowClues = [
  ['R4C5', 'R3C5'],
  ['R5C4', 'R5C3'],
  ['R6C8', 'R6C7'],
  ['R7C9', 'R7C8'],
  ['R8C6', 'R7C6'],
  ['R9C7', 'R8C7'],
  ['R9C8', 'R8C8'],
];

// The two drawn cages with their top-left clues.
const cageClues = [
  [21, ['R6C4', 'R7C4', 'R8C4']],
  [13, ['R5C3', 'R6C3']],
];

// A number written across p cells runs from rep(p) to 9*rep(p): the grid's
// digits are 1-9, so no cell can hold a 0 and no number can carry a leading
// zero.
const rep = (p) => Number('1'.repeat(p));

// Cuts of a line of `length` cells into at least two consecutive numbers, as
// arrays of cell counts. Interval propagation through n -> [2n, 3n] (forwards,
// then backwards) drops the cuts whose digit-count ranges leave nothing to
// satisfy - a cut that no digits at all could fill. It removes only branches
// that are already unsatisfiable, so the disjunction below still covers every
// legal cut.
const cutIsFeasible = (parts) => {
  const los = parts.map(rep);
  const his = parts.map((p) => 9 * rep(p));
  for (let i = 1; i < parts.length; i++) {
    los[i] = Math.max(los[i], 2 * los[i - 1]);
    his[i] = Math.min(his[i], 3 * his[i - 1]);
    if (los[i] > his[i]) return false;
  }
  for (let i = parts.length - 2; i >= 0; i--) {
    los[i] = Math.max(los[i], Math.ceil(los[i + 1] / 3));
    his[i] = Math.min(his[i], Math.floor(his[i + 1] / 2));
    if (los[i] > his[i]) return false;
  }
  return true;
};

const cuts = (length) => {
  const out = [];
  const extend = (remaining, parts) => {
    if (remaining === 0) {
      if (parts.length >= 2 && cutIsFeasible(parts)) out.push(parts);
      return;
    }
    for (let p = 1; p <= remaining; p++) extend(remaining - p, [...parts, p]);
  };
  extend(length, []);
  return out;
};

// One number is at least double and at most triple the number before it.
//
// Carrying the earlier number's value as state would need one state per value
// of it (up to five digits on the long line). Instead the machine reads the two
// numbers digit-aligned - interleaved from their most significant ends, which
// are their bulb-end cells - and carries only the two running differences
//     u = (later so far) - 2*(earlier so far),   which must end >= 0
//     v = 3*(earlier so far) - (later so far),   which must end >= 0
// With r decimal places still unread, those places move u by between
// -17*rep(r) and +7*rep(r) and v by between -6*rep(r) and +26*rep(r) (each
// place contributes d - 2c to u and 3c - d to v, for digits c, d in 1..9).
// Since rep(r) < 10^r / 9 * 10, that makes u < 0 and v < -2 unrecoverable -
// dead branches - and u >= 2 and v >= 1 unfailable - absorbing sinks. So u
// stays in {0, 1, 2} and v in {-2, -1, 0, 1}, 91 reachable states in all.
//
// `c` is the earlier number's digit at the place currently being read, or null
// when the next cell read is one of the earlier number's digits. A `pad` of 1
// means the later number has one place more than the earlier one, so the
// machine starts opposite an implicit leading zero: c = 0.
const numberGrowsSpec = (pad) => NFA.encodeSpec({
  startState: { u: 0, v: 0, c: pad === 1 ? 0 : null },
  transition: ({ u, v, c }, value) => {
    if (c === null) return { u, v, c: value };
    let nu = u >= 2 ? 2 : 10 * u + value - 2 * c;
    if (nu < 0) return undefined;
    if (nu > 2) nu = 2;
    let nv = v >= 1 ? 1 : 10 * v + 3 * c - value;
    if (nv < -2) return undefined;
    if (nv > 1) nv = 1;
    return { u: nu, v: nv, c: null };
  },
  // u >= 0 holds already: transition kills the branches where it fails.
  accept: ({ v, c }) => c === null && v >= 0,
}, shape);

const numberGrowsSpecs = [numberGrowsSpec(0), numberGrowsSpec(1)];

const numberGrows = (earlier, later) => {
  const pad = later.length - earlier.length;
  // A feasible cut never shrinks a number (they increase) and never widens one
  // by two places (that would be more than triple), so pad is 0 or 1.
  if (pad !== 0 && pad !== 1) throw new Error('unexpected number widths');
  const interleaved = [];
  for (let t = 0; t < later.length; t++) {
    if (t >= pad) interleaved.push(earlier[t - pad]);
    interleaved.push(later[t]);
  }
  return new NFA(numberGrowsSpecs[pad], 'double-to-triple', interleaved);
};

const thermoConstraint = (cells) => {
  const arrows = arrowClues.filter(([, target]) => cells.includes(target));
  return new Or(cuts(cells.length).map((parts) => {
    const numbers = [];
    for (let i = 0, at = 0; i < parts.length; at += parts[i], i++) {
      numbers.push(cells.slice(at, at + parts[i]));
    }
    return new And([
      ...numbers.slice(1).map((later, i) => numberGrows(numbers[i], later)),
      ...arrows.map(([arrowCell, target]) => new Given(
        arrowCell,
        numbers[numbers.findIndex((n) => n.includes(target))].length)),
    ]);
  }));
};

return [
  shape,
  ...thermoLines.map(thermoConstraint),
  // Cage rather than Sum: the drawn cages are flagged all-different, which
  // costs nothing either way here since each sits inside a single column.
  ...cageClues.map(([total, cells]) => new Cage(total, ...cells)),
];
