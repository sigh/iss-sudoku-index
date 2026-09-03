// Title: Anti-Sums
// Author: Sayori
// Video: https://www.youtube.com/watch?v=r4rHEPUhCTs
// Source: https://sudokupad.app/dfjxdryzuo

// Rules encoded:
//   Normal sudoku rules apply.
//   Digits in a cage must NOT sum to a total that satisfies the inequality in
//   the top left corner of the cage.  Digits MAY repeat in cages if allowed by
//   other rules (so no cage all-different).
//   Digits on an arrow must NOT sum to the number in the attached circle.
// Nothing is omitted.

// Cage cells and the inequality printed in each cage's top-left corner,
// transcribed from the 14 drawn cages.
const cages = [
  [['R1C1', 'R1C2'], '>7'],
  [['R1C4', 'R2C4'], '<13'],
  [['R1C6', 'R1C7', 'R2C6', 'R2C7'], '<31'],
  [['R3C3', 'R3C4', 'R4C3'], '>7'],
  [['R3C9', 'R4C9'], '<11'],
  [['R4C4', 'R5C4'], '<14'],
  [['R4C7', 'R4C8'], '<14'],
  [['R5C6', 'R6C6'], '>6'],
  [['R6C1', 'R7C1'], '>9'],
  [['R6C2', 'R6C3'], '>6'],
  [['R6C7', 'R7C6', 'R7C7'], '<23'],
  [['R7C9', 'R8C9'], '<10'],
  [['R8C3', 'R8C4', 'R9C3', 'R9C4'], '>9'],
  [['R8C6', 'R9C6'], '>7'],
];

// Negating the printed inequality leaves a one-sided bound on the cage total:
// ">K" forbids totals above K, so the total is at most K; "<K" forbids totals
// below K, so the total is at least K.  A bound becomes an equality Sum once the
// shortfall is a cell, so each cage gets one slack variable: total + slack
// equals the fixed target below, with the slack ranging over 1..slackMax.  The
// endpoints of that slack range are the trivial per-cell bounds (every cell is
// 1..9), so the pair reproduces the bound exactly and nothing more.
const slack = new Var('S', 'Cage slack', cages.length);

const cageBound = (cells, ineq) => {
  const k = Number(ineq.slice(1));
  // ">K": total <= K, target K+1, slack up to K+1-cells (min total = cells).
  // "<K": total >= K, target 9*cells+1, slack up to that minus K.
  return ineq[0] === '>'
    ? { target: k + 1, slackMax: k + 1 - cells.length }
    : { target: 9 * cells.length + 1, slackMax: 9 * cells.length + 1 - k };
};

const cageConstraints = cages.flatMap(([cells, ineq], i) => {
  const { target, slackMax } = cageBound(cells, ineq);
  const slackCell = slack.cell(i + 1);
  return [
    new Given(slackCell, ...Array.from({ length: slackMax }, (_, j) => j + 1)),
    new Sum(target, ...cells, slackCell),
  ];
});

// Arrows: bulb (circle) first, then the arm cells in drawn order.  Each drawn
// stroke runs from a circle to a ">"/"<" arrowhead glyph; two strokes leave the
// circle at R7C7, and the stroke from the circle at R4C8 joins the R3C8 stroke at
// R3C7 and shares its arrowhead at R3C6, so R3C7,R3C6 is that arrow's arm.
const arrows = [
  ['R2C2', 'R1C1', 'R1C2'],
  ['R3C8', 'R3C7', 'R3C6'],
  ['R4C8', 'R3C7', 'R3C6'],
  ['R7C3', 'R8C3', 'R9C4', 'R9C3'],
  ['R7C5', 'R6C6', 'R5C7'],
  ['R7C7', 'R8C7', 'R7C8', 'R7C9'],
  ['R7C7', 'R6C8'],
];

// One machine per arrow, reading the bulb first and then the arm.  State holds
// the bulb digit and the running arm total, saturated at 10 because an arm total
// that has passed 9 can never come back down to a single-digit bulb; `accept`
// then rejects exactly the totals that equal the bulb.
const antiArrowSpec = NFA.encodeSpec({
  startState: { bulb: null, sum: 0 },
  transition: ({ bulb, sum }, value) =>
    bulb === null
      ? { bulb: value, sum: 0 }
      : { bulb, sum: Math.min(sum + value, 10) },
  accept: ({ bulb, sum }) => bulb !== null && sum !== bulb,
}, 9);

return [
  new Shape('9x9'),
  slack,
  ...cageConstraints,
  ...arrows.map(cells => new NFA(antiArrowSpec, 'Anti-arrow', ...cells)),
];
