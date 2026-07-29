// Title: Mislabeled Killers
// Author: CaptZebraCakes
// Video: https://www.youtube.com/watch?v=v8F3ISG8ZHE
// Source: https://sudokupad.app/ejfmnsdqaf

// Normal Sudoku applies. Each drawn cage has no repeated digit. Its left-to-right
// two-cell pill is the sum of one other cage, never its own; all cage totals differ.
// The rules do not explicitly require the pills to name distinct target cages,
// so this does not add a one-to-one pill-to-cage assignment.
// Cage and pill coordinates are transcribed from the drawn cage and pill data.
const cages = [
  { cells: ['R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C1'], pill: ['R4C1', 'R4C2'] },
  { cells: ['R9C2', 'R9C3'], pill: ['R9C2', 'R9C3'] },
  { cells: ['R6C2', 'R6C3', 'R7C2', 'R7C3', 'R8C2'], pill: ['R6C2', 'R6C3'] },
  { cells: ['R2C8', 'R2C9', 'R3C8', 'R3C9'], pill: ['R2C8', 'R2C9'] },
  { cells: ['R1C1', 'R1C2', 'R2C2'], pill: ['R1C1', 'R1C2'] },
  { cells: ['R8C5', 'R8C6', 'R9C6', 'R9C7'], pill: ['R8C5', 'R8C6'] },
  { cells: ['R1C4', 'R1C5', 'R2C4', 'R2C5', 'R2C6', 'R3C6'], pill: ['R1C4', 'R1C5'] },
  { cells: ['R4C7', 'R4C8', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C7', 'R6C8', 'R7C7'], pill: ['R5C5', 'R5C6'] },
  { cells: ['R5C3', 'R5C4', 'R6C4', 'R6C5', 'R7C5'], pill: ['R5C3', 'R5C4'] },
];

function differentTotals(first, second) {
  const split = first.length;
  // State is the running first-cage total minus the second-cage total.
  const spec = NFA.encodeSpec({
    startState: { index: 0, difference: 0 },
    transition: ({ index, difference }, value) => ({
      index: index + 1,
      difference: difference + (index < split ? value : -value),
    }),
    accept: ({ difference }) => difference !== 0,
    maxDepth: first.length + second.length,
  }, 9);
  return new NFA(spec, 'different cage totals', ...first, ...second);
}

const cageDistinctness = cages.map(({ cells }) => new AllDifferent(...cells));
const mislabeledPills = cages.map((cage, own) => {
  const [tens, ones] = cage.pill;
  const alternatives = cages
    .filter((_, target) => target !== own)
    .map(({ cells }) => new Sum(0, ...cells, [tens, -10], [ones, -1]));
  return new Or(alternatives);
});

const unequalCageTotals = [];
for (let first = 0; first < cages.length; first++) {
  for (let second = first + 1; second < cages.length; second++) {
    unequalCageTotals.push(differentTotals(cages[first].cells, cages[second].cells));
  }
}

return [
  new Given('R8C8', 6),
  ...cageDistinctness,
  ...mislabeledPills,
  ...unequalCageTotals,
];
