// Title: Killer Cage Chaos Construction
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=fiC4eKirLuM
// Source: https://sudokupad.app/w4wnsq4p8k

// Latin rows/columns and nine connected nine-cell regions; killer cages;
// cage digits count unobstructed region cells in their row/column, including self.
// Adjacent cells in each cage share a region iff their digits share parity.
// The two black dots impose a 2:1 digit ratio.
const shape = new Shape('9x9');
const cc = cellGraph('9x9').makeOverlay('CC');
// The nine drawn dashed cages and their printed corner totals.
const cages = [
  [9, ['R2C2','R2C3','R3C2']],
  [6, ['R3C4','R3C5']],
  [10, ['R1C1','R1C2']],
  [10, ['R1C6','R1C7']],
  [8, ['R5C7','R5C8']],
  [16, ['R9C2','R9C3']],
  [12, ['R8C9','R9C9']],
  [8, ['R5C4','R6C4']],
  [12, ['R7C5','R8C5']],
];
// Pair predicates compare parity; the disjunction couples that result to labels.
const sameParity = Pair.fnToKey((a,b) => a % 2 === b % 2, shape);
const differentParity = Pair.fnToKey((a,b) => a % 2 !== b % 2, shape);
const killerCages = cages.map(([total, cells]) => new Cage(total, ...cells));
const visibility = cages.flatMap(([, cells]) => cells.map(cell => new ChaosArrow(cell, 0)));
const parityRegions = cages.flatMap(([, cells]) => cells.flatMap((a, i) =>
  cells.slice(i + 1).flatMap(b => {
    const pa = parseCellId(a), pb = parseCellId(b);
    if (Math.abs(pa.row - pb.row) + Math.abs(pa.col - pb.col) !== 1) return [];
    const labels = cc.at([a,b]);
    return [new Or([
      new And([new Pair(sameParity, 'Same parity', a,b), new SameValues(2, ...labels)]),
      new And([new Pair(differentParity, 'Different parity', a,b), new AllDifferent(...labels)]),
    ])];
  })
));
// The two filled black edge dots.
return [shape, new NoBoxes(), new ChaosConstruction(), ...killerCages,
  ...visibility, ...parityRegions,
  new BlackDot('R9C7','R9C8'), new BlackDot('R3C2','R4C2')];
