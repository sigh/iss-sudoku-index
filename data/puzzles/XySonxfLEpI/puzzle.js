// Title: Orchard
// Author: Blobz
// Video: https://www.youtube.com/watch?v=XySonxfLEpI
// Source: https://app.crackingthecryptic.com/blobz/orchard

// Normal Sudoku and the placement and digit-distribution rules for hidden
// Doubler Fruit. VD is a 1/2 overlay: 2 marks a doubler. The NFA reads each
// grid digit followed by its VD flag, requiring exactly one doubler per digit.
const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const interleave = cells => cells.flatMap(cell => [cell, flags.at(cell)]);

// One compact machine per digit counts its doubled occurrence.  Splitting the
// counts avoids a 9-bit histogram state while enforcing the same rule.
const doublerSpec = digit => NFA.encodeSpec({
  startState: { readingDigit: true, matchesDigit: false, count: 0 },
  transition({ readingDigit, matchesDigit, count }, value) {
    if (readingDigit) {
      return { readingDigit: false, matchesDigit: value === digit, count };
    }
    const nextCount = count + (matchesDigit && value === 2 ? 1 : 0);
    return nextCount > 1
      ? undefined
      : { readingDigit: true, matchesDigit: false, count: nextCount };
  },
  accept: ({ readingDigit, count }) => readingDigit && count === 1,
  maxDepth: 162,
}, 9);

const treeTips = [
  ['R1C3', 'R1C2', 'R2C4', 'R3C2'],
  ['R3C5', 'R7C5', 'R5C4', 'R4C6', 'R3C4'],
  ['R5C2', 'R9C2', 'R7C1', 'R6C3', 'R5C1', 'R9C3'],
  ['R2C8', 'R6C8', 'R4C7', 'R2C7', 'R3C9'],
];

return [
  new Shape('9x9'),
  flags.toVar('Doubler Fruit'),
  flags.makeReplicate(new Given(flags.cells()[0], 1, 2)),

  ...graph.rows().map(row => new ContainExact('2', ...flags.at(row))),
  ...graph.columns().map(column => new ContainExact('2', ...flags.at(column))),
  ...graph.boxes().map(box => new ContainExact('2', ...flags.at(box))),
  ...treeTips.map(tips => new ContainExact('2', ...flags.at(tips))),
  ...Array.from({ length: 9 }, (_, i) =>
    new NFA(doublerSpec(i + 1), `Doubled${i + 1}`, ...interleave(graph.cells()))),
];
