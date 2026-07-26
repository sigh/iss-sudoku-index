// Title: Three is a crowd
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=EDp2kt_EE6k
// Source: https://sudokupad.app/2j457uhz0t
//
// Normal sudoku. Eleven killer cages (distinct digits, sum to the shown
// total); four cages have their total hidden and are encoded as plain
// AllDifferent groups. Four white dots (Kropki, consecutive digits). Six
// purple lines: along each, every run of three consecutive line-cells must
// sum to a multiple of three.
//
// A seventh drawn stroke is a single-cell stub at R1C6 that never joins
// another cell (both its waypoints sit inside R1C6); it cannot form any
// 3-cell run under this rule, so it contributes no constraint and is omitted.

// Shared state machine for "every run of 3 consecutive cells sums to a
// multiple of 3": track the mod-3 residues of the previous two digits, and
// once two are available, reject unless the incoming third digit's residue
// completes a multiple of 3. `accept` is unconditional because every
// violation is already rejected mid-scan via the `undefined` transition.
const mod3TrioSpec = NFA.encodeSpec({
  startState: { prev2: null, prev1: null },
  transition: ({ prev2, prev1 }, value) => {
    const r = value % 3;
    if (prev2 !== null && (prev2 + prev1 + r) % 3 !== 0) return undefined;
    return { prev2: prev1, prev1: r };
  },
  accept: () => true,
}, 9);

// A closed purple loop's "consecutive group of three" wraps around, giving
// two extra windows that cross from the end of the list back to the start.
// Scanning the loop's cells with its own first two cells appended reproduces
// exactly those wraparound windows through the same linear state machine.
const closeLoop = (cells) => [...cells, cells[0], cells[1]];

const purpleLines = [
  new NFA(mod3TrioSpec, 'Mod3', 'R4C4', 'R4C3', 'R4C2'),
  new NFA(mod3TrioSpec, 'Mod3', 'R4C6', 'R3C6', 'R2C7', 'R2C6'),
  new NFA(mod3TrioSpec, 'Mod3', 'R6C3', 'R6C4', 'R7C4', 'R8C4', 'R9C4'),
  new NFA(mod3TrioSpec, 'Mod3', 'R6C6', 'R7C6', 'R6C7', 'R5C8', 'R6C8'),
  new NFA(mod3TrioSpec, 'Mod3', ...closeLoop(['R2C3', 'R2C2', 'R1C3', 'R1C4'])),
  new NFA(mod3TrioSpec, 'Mod3', ...closeLoop(['R9C5', 'R9C6', 'R9C7', 'R8C8', 'R8C7', 'R8C6'])),
];

return [
  new Shape('9x9'),

  new Given('R5C5', 3),

  // Killer cages with a shown total.
  new Cage(15, 'R6C1', 'R6C2'),
  new Cage(5, 'R4C8', 'R4C9'),
  new Cage(17, 'R8C7', 'R9C7', 'R9C8'),
  new Cage(8, 'R1C2', 'R1C3', 'R2C3'),
  new Cage(8, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(17, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(12, 'R4C5', 'R5C5', 'R6C5'),

  // Killer cages whose total is hidden ("?" on the grid): distinct digits,
  // no sum constraint.
  new AllDifferent('R4C2', 'R4C3', 'R4C4'),
  new AllDifferent('R2C6', 'R3C6', 'R4C6'),
  new AllDifferent('R6C6', 'R6C7', 'R6C8'),
  new AllDifferent('R6C4', 'R7C4', 'R8C4'),

  // White dots: consecutive digits.
  new WhiteDot('R1C6', 'R1C7'),
  new WhiteDot('R1C7', 'R2C7'),
  new WhiteDot('R8C3', 'R9C3'),
  new WhiteDot('R9C3', 'R9C4'),

  ...purpleLines,
];
