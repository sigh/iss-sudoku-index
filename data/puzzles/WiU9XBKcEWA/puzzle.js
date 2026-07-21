// Title: Scientist's split-arrows !
// Author: LNOMISL
// Video: https://www.youtube.com/watch?v=WiU9XBKcEWA
// Source: https://sudokupad.app/fmoz7mzj21

// Each incoming arrow half is matched bijectively to one outgoing half. The
// matching endpoint digits agree, and the complete arm sums to its circle.

const incoming = [
  { bulb: 'R2C2', teleporter: 'R1C2' },
  { bulb: 'R3C2', teleporter: 'R3C3' },
  { bulb: 'R4C2', teleporter: 'R4C1' },
  { bulb: 'R5C2', teleporter: 'R5C3' },
  { bulb: 'R6C2', teleporter: 'R6C1' },
  { bulb: 'R7C2', teleporter: 'R7C3' },
  { bulb: 'R8C2', teleporter: 'R8C1' },
];

const outgoing = [
  ['R2C6', 'R3C7'],
  ['R3C6', 'R4C5'],
  ['R6C5', 'R7C6'],
  ['R8C5', 'R8C6', 'R8C7'],
  ['R9C8', 'R9C9'],
  ['R6C5', 'R5C4'],
  ['R4C8', 'R5C9'],
];

const selections = new Var('S', 'outgoing half selected by each circle', 7);
const distinctCounts = new Var('D', 'distinct digits on each complete arm', 7);

const splitArrows = incoming.map(({ bulb, teleporter }, arrowIndex) => {
  const selection = selections.cell(arrowIndex + 1);
  const distinct = distinctCounts.cell(arrowIndex + 1);
  return new Or(outgoing.map((exit, exitIndex) => {
    const arm = [teleporter, ...exit];
    return new And([
      new Given(selection, exitIndex + 1),
      new SameValues(2, teleporter, exit[0]),
      new Arrow(bulb, ...arm),
      new CountDistinct(distinct, ...arm),
    ]);
  }));
});

const whiteDots = [
  ['R6C2', 'R6C3'],
  ['R3C4', 'R4C4'],
  ['R2C4', 'R3C4'],
  ['R9C4', 'R9C5'],
  ['R1C9', 'R2C9'],
];

return [
  new Shape('9x9'),
  selections,
  distinctCounts,
  new AllDifferent(...selections.cells()),
  ...splitArrows,
  // Six arrows have the stated pattern counts. The seventh is deliberately
  // unrestricted: its pattern is part of the solve and may repeat a count.
  new ContainAtLeast('1_1_1_2_2_3', ...distinctCounts.cells()),
  new Thermo('R7C8', 'R6C8', 'R6C7', 'R5C7', 'R5C6'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
