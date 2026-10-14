// Title: Split At Birth
// Author: MathGuy_12 & Chinstrap
// Video: https://www.youtube.com/watch?v=tLWSJG4PG84
// Source: https://sudokupad.app/fvdkiaq6vi?setting-nogrid=true

// Each physical cell holds one digit or two distinct ordered digits.
// Each digit occurs five times and its physical cells are orthogonally connected.
// Each DNA sum equals an arbitrary concatenation of its two zygotes' digits.
const shape = new Shape('10x10', '0-9', 'Raw');
const graph = cellGraph('5x5');
// The drawn pink 5x5 grid uses 2x2 input-cell blocks for digit placement.
const cells = Array.from({length: 25}, (_, i) => {
  const row = Math.floor(i / 5), col = i % 5;
  return [makeCellId(2 * row + 1, 2 * col + 1),
          makeCellId(2 * row + 2, 2 * col + 2)];
});
const allDigits = cells.flat();
const occupied = new Set(allDigits);
const padding = cellGraph(shape).cells().filter(c => !occupied.has(c));
// Zero denotes the absent bottom-right digit; a present second digit is larger.
const orderKey = Pair.fnToKey((a, b) => a >= 1 && (b === 0 || a < b), shape);
const memberships = Array.from({length: 9}, (_, i) => {
  const digit = i + 1;
  const prefix = 'V' + String.fromCharCode(65 + i);
  const overlay = graph.makeOverlay(prefix);
  return {digit, overlay, prefix};
});
// The membership flag is one exactly when either slot contains this digit.
const indicators = memberships.flatMap(({digit, overlay}) => cells.map(([a, b], i) => {
  const flag = overlay.cells()[i];
  return new Or([
    new And([new Given(flag, 1), new Or([new Given(a, digit), new Given(b, digit)])]),
    new And([new Given(flag, 0),
      new Given(a, ...Array.from({length: 9}, (_, n) => n + 1).filter(v => v !== digit)),
      new Given(b, ...Array.from({length: 10}, (_, n) => n).filter(v => v !== digit))])
  ]);
}));
// Drawn DNA courses and zygotes; the initial video counts 7/4/5 cells,
// excluding the decorative waves' brief corner grazes.
const strands = [
  {ends: [[1,2],[1,5]], path: [[1,1],[2,2],[3,2],[3,3],[3,4],[2,3],[2,4]]},
  {ends: [[3,1],[5,1]], path: [[3,2],[4,3],[5,3],[5,2]]},
  {ends: [[4,5],[5,5]], path: [[4,4],[3,3],[4,2],[5,3],[5,4]]}
];
const slotsAt = ([r,c]) => cells[(r - 1) * 5 + c - 1];
const permutations = values => values.length === 0 ? [[]] : values.flatMap((v, i) =>
  permutations(values.filter((_, j) => i !== j)).map(rest => [v, ...rest]));
// All four endpoint digits would make at least 1111, while seven S-cells
// sum to at most 7*(8+9)=119. Thus only two- and three-digit branches can hold.
const dna = strands.map(({ends, path}) => {
  const [[a,b],[c,d]] = ends.map(slotsAt);
  const arm = path.flatMap(slotsAt);
  const layouts = [
    {digits: [a,c], absent: [b,d], present: []},
    {digits: [a,b,c], absent: [d], present: [b]},
    {digits: [a,c,d], absent: [b], present: [d]}
  ];
  return new Or(layouts.map(({digits, absent, present}) => new And([
    ...absent.map(cell => new Given(cell, 0)),
    ...present.map(cell => new Given(cell, 1,2,3,4,5,6,7,8,9)),
    new Or(permutations(digits).map(order => new Sum(0, ...arm,
      ...order.map((cell, i) => [cell, -(10 ** (order.length - i - 1))]))))
  ])));
});
return [shape,
  cellGraph(shape).makeReplicate(new Given(makeCellId(1, 1), 0), padding),
  ...cells.map(([a, b]) => new Pair(orderKey, 'ordered slots', a, b)),
  ...Array.from({length: 9}, (_, i) => new ContainExact(Array(5).fill(i + 1).join('_'), ...allDigits)),
  ...memberships.map(({digit, overlay}) => overlay.toVar('digit ' + digit + ' membership')),
  ...indicators,
  ...memberships.map(({prefix}) => new ConnectedValues(prefix, [1], 5)),
  ...dna
];
