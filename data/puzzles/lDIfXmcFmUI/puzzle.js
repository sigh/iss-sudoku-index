// Title: FIFA World Cup 2022
// Author: Arlo Lipof
// Video: https://www.youtube.com/watch?v=lDIfXmcFmUI
// Source: https://app.crackingthecryptic.com/sudoku/BPb9d9bbG7

// Normal sudoku rules apply. Digits cannot repeat within cages, and sum to the
// small clue (if given) in the top left corner. Digits along arrows sum to the
// number in its circled cell. Digits in cells joined by a large white dot are
// consecutive, and digits in cells joined by a large black dot are in a 1:2
// ratio. Sums of killer cages joined by a small white dot are consecutive, and
// sums of killer cages joined by a small black dot are in a 1:2 ratio. Not all
// dots are given. Digits along purple lines form a set of consecutive digits in
// any order. Adjacent digits along green lines must differ by at least 5.
//
// No givens. Nothing is omitted. "Not all dots are given" waives the negative
// dot constraint, so no strict dot class is used. The solid green fill behind
// rows 4-9 is artwork and carries no rule.

// The nine drawn cages, in payload order; they partition rows 1-3. Only the
// last carries a printed total.
const cages = [
  { name: 'A', total: 0, cells: ['R2C1', 'R3C1'] },
  { name: 'B', total: 0, cells: ['R1C1', 'R1C2'] },
  { name: 'C', total: 0, cells: ['R2C2', 'R3C2', 'R3C3', 'R3C4'] },
  { name: 'D', total: 0, cells: ['R1C3', 'R1C4', 'R2C3'] },
  { name: 'E', total: 0, cells: ['R1C5', 'R2C4', 'R2C5', 'R3C5'] },
  { name: 'F', total: 0, cells: ['R2C6', 'R3C6', 'R3C7'] },
  { name: 'G', total: 0, cells: ['R1C6', 'R1C7', 'R2C7'] },
  { name: 'H', total: 0, cells: ['R1C8', 'R1C9', 'R2C8'] },
  { name: 'I', total: 14, cells: ['R2C9', 'R3C8', 'R3C9'] },
];

// Dots come in two drawn sizes, and the rules name both kinds. The small ones
// (a quarter of a cell) each sit on an edge between two different cages and are
// the cage-sum dots; the large ones (0.45 of a cell) sit on edges no pair of
// distinct cages shares, and are the dots on the two digits.

// Small dots, given as the drawn edge; which cages they join is derived below.
const cageSumDots = [
  { colour: 'white', edge: ['R1C1', 'R2C1'] },
  { colour: 'white', edge: ['R1C2', 'R2C2'] },
  { colour: 'white', edge: ['R1C2', 'R1C3'] },
  { colour: 'black', edge: ['R2C3', 'R2C4'] },
  { colour: 'black', edge: ['R2C5', 'R2C6'] },
  { colour: 'white', edge: ['R2C6', 'R2C7'] },
  { colour: 'white', edge: ['R1C7', 'R1C8'] },
  { colour: 'white', edge: ['R2C8', 'R2C9'] },
];

// Large dots.
const digitDots = [
  { colour: 'black', edge: ['R3C6', 'R3C7'] },
  { colour: 'black', edge: ['R3C1', 'R4C1'] },
  { colour: 'black', edge: ['R8C8', 'R9C8'] },
  { colour: 'white', edge: ['R6C4', 'R7C4'] },
  { colour: 'white', edge: ['R2C9', 'R3C9'] },
];

// The coloured strokes are ink, not one clue each: they compose four branching
// stick figures of players. Two green strokes even overlap along the whole
// R3C6-R3C5 segment, which draws a torso with limbs rather than two clue lines,
// and one purple stroke is a bare two-cell stub (R8C4-R9C5, a leg) that would
// duplicate a white dot if read as a clue of its own. A "line" is therefore a
// whole connected figure.
const greenStrokes = [
  ['R2C7', 'R3C6', 'R3C5', 'R3C4'],
  ['R4C7', 'R3C6', 'R3C5', 'R4C4'],
  ['R5C1', 'R4C1', 'R4C2'],
  ['R4C1', 'R5C2', 'R6C3'],
  ['R5C2', 'R5C3', 'R6C4'],
];

const purpleStrokes = [
  ['R8C3', 'R7C4', 'R7C5'],
  ['R7C4', 'R8C4', 'R9C4'],
  ['R8C4', 'R9C5'],
  ['R8C7', 'R9C8', 'R8C9'],
];

// Arrow: circle on R8C5, shaft interpolated along its two straight segments.
const arrow = ['R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9', 'R3C9'];

const cageOf = (cell) => {
  const cage = cages.find(c => c.cells.includes(cell));
  if (!cage) throw new Error(`no cage contains ${cell}`);
  return cage;
};

// Cage totals reach 30, so they do not fit in a Var over the 1-9 range. Each
// comparison is instead a linear equation over the two cages' cells, disjoined
// over the two directions the rule leaves open: consecutive is
// sum(x) - sum(y) = 1 either way round, and 1:2 is 2*sum(x) - sum(y) = 0 either
// way round.
const scaled = (cells, coeff) => cells.map(cell => [cell, coeff]);
const cageSumRelation = ({ colour, edge }) => {
  const [x, y] = edge.map(cell => cageOf(cell).cells);
  return colour === 'white'
    ? new Or([
      new Sum(1, ...x, ...scaled(y, -1)),
      new Sum(1, ...y, ...scaled(x, -1)),
    ])
    : new Or([
      new Sum(0, ...scaled(x, 2), ...scaled(y, -1)),
      new Sum(0, ...scaled(y, 2), ...scaled(x, -1)),
    ]);
};

// Union-by-shared-cell over the drawn strokes: each result is one figure's
// cell set, in first-drawn order.
const connectedFigures = (strokes) => {
  const figures = [];
  for (const stroke of strokes) {
    const touching = figures.filter(f => stroke.some(cell => f.includes(cell)));
    for (const figure of touching) figures.splice(figures.indexOf(figure), 1);
    figures.push(touching.flat().concat(stroke).filter(
      (cell, i, all) => all.indexOf(cell) === i));
  }
  return figures;
};

return [
  new Shape('9x9'),

  ...cages.map(c => new Cage(c.total, ...c.cells)),

  ...cageSumDots.map(cageSumRelation),

  ...digitDots.map(({ colour, edge }) => colour === 'white'
    ? new WhiteDot(...edge)
    : new BlackDot(...edge)),

  // A whisper reads only ink-adjacent pairs, so a figure's strokes give it the
  // same pairs one at a time; a renban reads the whole figure's cell set.
  ...greenStrokes.map(cells => new Whisper(5, ...cells)),

  ...connectedFigures(purpleStrokes).map(cells => new Renban(...cells)),

  new Arrow(...arrow),
];
