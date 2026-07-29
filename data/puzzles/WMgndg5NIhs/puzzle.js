// Title: In The Orchard
// Author: Philipp Blume, aka glum_hippo
// Video: https://www.youtube.com/watch?v=WMgndg5NIhs
// Source: https://app.crackingthecryptic.com/bTddT728fG

// Standard 9x9 Sudoku inset from the source canvas. Each outside circle is a
// Var digit that is simultaneously its arrow bulb, skyscraper sum, and rank.

const graph = cellGraph('9x9');
const tens = new Var('T', 'circle-clue tens', 5);
const ones = new Var('O', 'circle-clue ones', 5);
const bulb = (index) => ({ tens: tens.cell(index), ones: ones.cell(index) });

const clues = [
  { ...bulb(1), line: graph.column(6), arms: ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6'] },
  { ...bulb(2), line: [...graph.row(5)].reverse(), arms: ['R5C9', 'R4C8', 'R5C7'] },
  { ...bulb(3), line: [...graph.row(8)].reverse(), arms: ['R8C9', 'R9C8', 'R9C7', 'R8C6'] },
  { ...bulb(4), line: graph.row(5), arms: ['R5C1', 'R5C2', 'R5C3', 'R5C4'] },
  { ...bulb(5), line: graph.column(8), arms: ['R1C7', 'R2C7', 'R3C7', 'R4C6', 'R5C5', 'R4C4', 'R3C4'] },
];

const skyscraperSumSpec = (target) => NFA.encodeSpec({
  startState: { tallest: 0, sum: 0 },
  transition: ({ tallest, sum }, value) => {
    const nextTallest = Math.max(tallest, value);
    const nextSum = sum + (value > tallest ? value : 0);
    return nextSum > target ? undefined : { tallest: nextTallest, sum: nextSum };
  },
  accept: ({ sum }) => sum === target,
}, 9);

const fullRankFor = ({ tens, ones, line, arms }) => new Or(Array.from({ length: 36 }, (_, i) => i + 1).map(rank =>
  new And([
    new Given(tens, Math.ceil(rank / 9)),
    new Given(ones, (rank - 1) % 9 + 1),
    new Sum(-9, ...arms, [tens, -9], [ones, -1]),
    new NFA(skyscraperSumSpec(rank), 'skyscraper sum', ...line),
    FullRank.fromCells(rank, line, graph.gridGeometry()),
  ])
));

return [
  new Shape('9x9'),
  tens,
  ones,
  new FullRankTies('none'),
  new Given('R3C5', 9),
  new Given('R3C9', 6),
  new Given('R7C1', 1),
  ...clues.map(fullRankFor),
];
