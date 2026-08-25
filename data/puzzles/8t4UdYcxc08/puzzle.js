// Title: Thermodiamonds
// Author: J J Olsen
// Video: https://www.youtube.com/watch?v=8t4UdYcxc08
// Source: https://app.crackingthecryptic.com/sudoku/NF473RnHDn

// Normal sudoku rules apply (standard 9x9, default boxes, no givens). Four
// diamond-shaped thermometers require digits to increase or stay the same
// from the bulb to the tip; no endpoint carries a bulb mark in the drawn
// geometry, matching the rules text's own "to be discovered" -- so each
// thermometer's direction is a disjunction over both fixed orientations, not
// a per-step choice. Two marked diagonals (the two thickness-5 lines) must
// have equal digit products; no other rule is drawn on them (no diagonal
// uniqueness).

const graph = cellGraph('9x9');

// Diamond thermometers, one cell path per drawn line (order as drawn).
const thermos = [
  ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5',
    'R8C4', 'R7C3', 'R6C2', 'R5C1', 'R4C2', 'R3C3', 'R2C4'], // grey
  ['R8C5', 'R7C4', 'R6C3', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R3C6', 'R4C7',
    'R5C8', 'R6C7', 'R7C6'], // yellow-green
  ['R5C5', 'R4C6', 'R3C5', 'R4C4', 'R5C3', 'R6C4', 'R7C5', 'R6C6', 'R5C7'], // gold
  ['R4C5', 'R5C4', 'R6C5', 'R5C6'], // brown
];

// Weakly monotone in a fixed but unknown direction: state stays `dir: null`
// while every value seen so far has been equal (undecided), locks to 'inc'
// or 'dec' at the first strict step, and any later step must not reverse it.
// This is exactly "non-decreasing forward, OR non-decreasing backward" -- an
// `Or` over the line's two orientations -- collapsed into one small NFA
// instead of two full copies.
function unknownDirectionThermoSpec() {
  return NFA.encodeSpec({
    startState: { dir: null, prev: null },
    transition: ({ dir, prev }, value) => {
      if (prev === null) return { dir: null, prev: value };
      if (dir === null) {
        if (value > prev) return { dir: 'inc', prev: value };
        if (value < prev) return { dir: 'dec', prev: value };
        return { dir: null, prev: value };
      }
      if (dir === 'inc') return value >= prev ? { dir, prev: value } : undefined;
      return value <= prev ? { dir, prev: value } : undefined;
    },
    accept: () => true,
  }, 9);
}

const thermoConstraints = thermos.map(
  (cells, i) => new NFA(unknownDirectionThermoSpec(), `thermo ${i} (unknown bulb end)`, ...cells));

// The two marked diagonals. They cross at R5C5.
const diagA = ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'];
const diagB = ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'];
const diagCells = [...new Set([...diagA, ...diagB])];

// Equal products <=> equal per-prime exponent totals, since every digit 1-9
// factors only into 2, 3, 5, 7. Each table gives that prime's exponent in
// digit d, shifted +1 so the overlay Var never needs value 0 (stays inside
// the default 1-9 range). Both diagonals hold exactly 9 cells, so the +1
// shift adds the same +9 to each side of the EqualSum below and cancels
// unchanged; only the true exponent totals decide the equality.
// Var prefixes must be plain A-Z letters, so each prime gets a one-letter
// overlay tag (P2 -> B, P3 -> C, P5 -> E, P7 -> G) rather than its digit.
const PRIME_EXPONENT_PLUS_ONE_TABLES = [
  { prime: 2, tag: 'B', table: { 1: 1, 2: 2, 3: 1, 4: 3, 5: 1, 6: 2, 7: 1, 8: 4, 9: 1 } },
  { prime: 3, tag: 'C', table: { 1: 1, 2: 1, 3: 2, 4: 1, 5: 1, 6: 2, 7: 1, 8: 1, 9: 3 } },
  { prime: 5, tag: 'E', table: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 } },
  { prime: 7, tag: 'G', table: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 2, 8: 1, 9: 1 } },
];

const equalProductConstraints = PRIME_EXPONENT_PLUS_ONE_TABLES
  .flatMap(({ prime, tag, table }) => {
    const overlay = graph.makeOverlay('V' + tag, diagCells);
    const reachableValues = [...new Set(Object.values(table))];
    const key = Pair.fnToKey((digit, exp) => exp === table[digit], graph.gridGeometry());

    const links = diagCells.map(cell =>
      new Pair(key, `digit -> ${prime}-exponent+1`, cell, overlay.at(cell)));
    const domains = diagCells.map(cell => new Given(overlay.at(cell), ...reachableValues));
    // Equal +1-shifted totals over equal-length (9-cell) segments imply equal
    // true exponent totals -- the shift cancels.
    const balance = new EqualSum(overlay.at(diagA), overlay.at(diagB));

    return [overlay.toVar(`${prime}-exponent+1`), ...links, ...domains, balance];
  });

return [
  new Shape('9x9'),
  ...thermoConstraints,
  ...equalProductConstraints,
];
