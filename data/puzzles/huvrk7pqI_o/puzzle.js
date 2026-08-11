// Title: Maximum Friendliness
// Author: Thoughtbyte
// Video: https://www.youtube.com/watch?v=huvrk7pqI_o
// Source: https://app.crackingthecryptic.com/sudoku/4RnLTmTgR4

// 6x6 sudoku, rows/columns/boxes 1-6 (default box order below matches the
// payload's own region order, top-to-bottom left-to-right). A cell is
// "friendly" if its digit equals its row number, column number, or box
// number; each box holds exactly 3 friendly cells. Encode friendliness as a
// parallel Var flag (1 = not friendly, 2 = friendly) tied to each cell's
// digit by a custom Pair whose truth table is that cell's own friendly set
// {row, col, box}; a box's flags then sum to 9 (6 baseline + 3 friendly).
// Purple line: Renban. Black dots: Kropki 2:1 ratio.

const shape = new Shape('6x6');
const graph = cellGraph(shape);
const flags = graph.makeOverlay('VF');
const flagVar = flags.toVar('friendly flags');

const boxNumber = (r, c) => Math.floor((r - 1) / 2) * 2 + Math.floor((c - 1) / 3) + 1;

const cellFacts = [];
for (let r = 1; r <= 6; r++) {
  for (let c = 1; c <= 6; c++) {
    const cell = makeCellId(r, c);
    const friendlySet = new Set([r, c, boxNumber(r, c)]);
    cellFacts.push({ cell, flag: flags.at(cell), friendlySet });
  }
}

const flagGivens = cellFacts.map(({ flag }) => new Given(flag, 1, 2));

const friendlyLinks = cellFacts.map(({ cell, flag, friendlySet }) => {
  const key = Pair.fnToKey((d, f) => (f === 2) === friendlySet.has(d), shape);
  return new Pair(key, 'friendly link', cell, flag);
});

// 6 cells/box, 3 friendly => flag sum (1 baseline + 1 if friendly) = 9.
const boxFriendlyCounts = graph.boxes().map(box =>
  new Sum(9, ...flags.at(box)));

const renban = new Renban('R2C4', 'R3C3', 'R4C4', 'R5C3');

const blackDots = [
  new BlackDot('R2C4', 'R2C5'),
  new BlackDot('R5C2', 'R5C3'),
];

return [
  shape,
  flagVar,
  ...flagGivens,
  ...friendlyLinks,
  ...boxFriendlyCounts,
  renban,
  ...blackDots,
];
