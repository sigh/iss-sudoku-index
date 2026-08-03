// Title: Only even ... or even only odd?
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=CoRb2PS4_is
// Source: https://app.crackingthecryptic.com/sudoku/D9fpjbmHRn

// Normal sudoku, no givens. Every marked diagonal and every 3-cell cage
// carries a "parity sum": the printed number equals either the sum of only
// the even digits it contains, or the sum of only the odd digits it
// contains (the other parity contributes nothing), and the puzzle does not
// say which reading applies to which clue. Cage digits are additionally
// required not to repeat.
//
// parityOr(target, cells) builds that disjunction directly from the actual
// digits: an NFA accumulates a running total of only the even (or only the
// odd) digits seen, clamped at target+1 so the state stays bounded, and
// accepts iff the total equals target; Or takes the even-mode and odd-mode
// machines together. Both totals are fully determined by the digits
// present, so no extra "which mode" state is needed.
function parityOr(target, cells) {
  function parityNFA(wantEven) {
    const spec = NFA.encodeSpec({
      startState: { sum: 0 },
      transition: ({ sum }, value) => {
        const counts = (value % 2 === 0) === wantEven;
        return { sum: Math.min(sum + (counts ? value : 0), target + 1) };
      },
      accept: ({ sum }) => sum === target,
      maxDepth: cells.length,
    }, 9);
    return new NFA(spec, `${wantEven ? 'even' : 'odd'}-sum-${target}`, ...cells);
  }
  return new Or([parityNFA(true), parityNFA(false)]);
}

// Outside diagonals: cells listed start-to-end along the drawn arrow;
// clue value recovered from each arrow's paired off-grid overlay text.
const DIAGONALS = [
  { target: 0, cells: ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'] },
  { target: 0, cells: ['R2C9', 'R3C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2'] },
  { target: 2, cells: ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'] },
  { target: 2, cells: ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'] },
  { target: 2, cells: ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8'] },
  { target: 0, cells: ['R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1'] },
  { target: 8, cells: ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3'] },
  { target: 4, cells: ['R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'] },
  { target: 32, cells: ['R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'] },
];

// 3-cell cages, transcribed from the raw payload's `cages` entries.
const CAGES = [
  { target: 7, cells: ['R7C2', 'R7C3', 'R8C2'] },
  { target: 1, cells: ['R7C5', 'R7C6', 'R8C5'] },
  { target: 15, cells: ['R8C8', 'R8C9', 'R9C8'] },
  { target: 3, cells: ['R4C2', 'R4C3', 'R5C3'] },
  { target: 16, cells: ['R5C1', 'R6C1', 'R6C2'] },
  { target: 5, cells: ['R2C5', 'R3C4', 'R3C5'] },
  { target: 8, cells: ['R4C6', 'R5C5', 'R5C6'] },
  { target: 9, cells: ['R2C8', 'R3C7', 'R3C8'] },
  { target: 18, cells: ['R4C8', 'R4C9', 'R5C8'] },
];

const diagonalConstraints = DIAGONALS.map(d => parityOr(d.target, d.cells));
// Cage no-repeat plus its own parity-sum disjunction.
const cageConstraints = CAGES.flatMap(c => [
  new AllDifferent(...c.cells),
  parityOr(c.target, c.cells),
]);

return [
  new Shape('9x9'),
  ...diagonalConstraints,
  ...cageConstraints,
];
