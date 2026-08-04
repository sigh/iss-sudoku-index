// Title: Serial Killers
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=CJXo25-B38o
// Source: https://app.crackingthecryptic.com/sudoku/FFhHh3HD8p

// Normal sudoku rules apply (Shape gives row/column/box all-different).
// Digits do not repeat within a cage (no cage prints a total). The board's
// five drawn underlay colours each form a jigsaw region, and the 26 cages
// below exactly tile those five regions (every colour cell belongs to
// exactly one cage; no cage crosses a colour boundary).
// For each colour, that colour's cage totals -- taken as a set, one value
// per cage -- must be a run of consecutive integers, in any correspondence
// between cage and value.

// Cage cell lists, grouped by underlay colour and transcribed from the
// drawn cage outlines cross-referenced with each cage's underlay fill.
const blueCages = [
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8'],
  ['R1C5', 'R2C5', 'R2C6', 'R2C7'],
  ['R3C4', 'R3C5'],
  ['R3C6', 'R3C7', 'R3C8'],
  ['R3C3', 'R2C3', 'R2C4'],
  ['R1C2', 'R1C3', 'R1C4'],
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R2C2'],
];
const redCages = [
  ['R3C9', 'R4C9'],
  ['R9C6', 'R9C7', 'R8C7', 'R8C8', 'R8C9'],
  ['R9C8', 'R9C9'],
  ['R7C8', 'R7C9', 'R6C9'],
  ['R5C7', 'R5C8', 'R5C9', 'R6C8'],
  ['R7C7', 'R6C7'],
  ['R4C7', 'R4C8'],
];
const goldCages = [
  ['R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6'],
  ['R5C5', 'R6C5'],
  ['R6C3', 'R6C4'],
  ['R5C3', 'R5C4'],
  ['R4C1', 'R4C2', 'R4C3'],
  ['R5C2', 'R5C1'],
];
const purpleCages = [
  ['R6C2', 'R6C1', 'R7C1'],
  ['R9C2', 'R9C1', 'R8C1', 'R8C2'],
  ['R7C2', 'R7C3', 'R8C3', 'R9C3'],
];
const greenCages = [
  ['R7C4', 'R7C5', 'R7C6'],
  ['R8C4', 'R8C5', 'R8C6'],
  ['R9C4', 'R9C5'],
];

const colourGroups = [blueCages, redCages, goldCages, purpleCages, greenCages];
const allCages = colourGroups.flat();

// Reads one cage's cells then another's, tracking their running total
// difference (left total minus right total so far). Accepting requires the
// two finished totals to differ (a set has no repeated element) and to lie
// within `groupSize` of one another. That second bound is the same trick
// Renban uses pairwise for "the values form a consecutive set": `groupSize`
// pairwise-distinct integers that are all within `groupSize` of each other
// span a window of exactly `groupSize` values, so they must fill it -- i.e.
// they are consecutive. Applying this to every pair within a colour's cages
// is equivalent to applying it to the whole set at once.
const totalDifferenceMachine = (leftLength, rightLength, groupSize) => NFA.encodeSpec({
  startState: { position: 0, difference: 0 },
  transition: ({ position, difference }, value) => ({
    position: position + 1,
    difference: difference + (position < leftLength ? value : -value),
  }),
  accept: ({ position, difference }) =>
    position === leftLength + rightLength &&
    difference !== 0 && Math.abs(difference) < groupSize,
  maxDepth: leftLength + rightLength,
}, 9);

// One pairwise NFA per same-colour cage pair.
const consecutiveSetConstraints = colourGroups.flatMap(group =>
  group.flatMap((left, i) => group.slice(i + 1).map(right => new NFA(
    totalDifferenceMachine(left.length, right.length, group.length),
    'same-colour cage totals form a consecutive set',
    ...left, ...right,
  ))));

return [
  new Shape('9x9'),
  ...allCages.map(cells => new AllDifferent(...cells)),
  ...consecutiveSetConstraints,
];
