// Title: Progressive Divisors
// Author: DiMono
// Video: https://www.youtube.com/watch?v=8hF548RzOT0
// Source: https://tinyurl.com/progressivedivisors

// Normal Sudoku; row 1 and the marked self-length prefixes are progressive
// divisors. Nine non-overlapping connected regions contain their row-1 anchors
// and sum to three times those digits; branching and repeated digits are allowed.
// The two drawn cages read left-to-right and are divisible by both or neither digit.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const digits = [1,2,3,4,5,6,7,8,9];
const cells = graph.cells();
// The residue state is the decimal prefix modulo its required divisor.
const divisible = k => NFA.encodeSpec({
  startState: 0,
  transition: (r, v) => (10*r + v) % k,
  accept: r => r === 0,
}, shape);
const evenNumber = Pair.fnToKey((a,b) => (10*a+b)%2 === 0, shape);
const prefixRules = (ray,n=9) => [
  ...(n >= 2 ? [new Pair(evenNumber, 'two-digit prefix divisible by 2', ...ray.slice(0,2))] : []),
  ...digits.filter(k => k >= 3 && k <= n).map(k => new NFA(divisible(k), `prefix divisible by ${k}`, ray.slice(0,k))),
];
const row = r => digits.map(c => makeCellId(r,c));
const col = c => digits.map(r => makeCellId(r,c));
// Outside arrowheads: top C1,C6; bottom C1; right R2,R6,R7,R9;
// left R5,R8,R9, all pointing into the board.
const rays = [col(1),col(6),col(1).reverse(), ...[2,6,7,9].map(r => row(r).reverse()), ...[5,8,9].map(row)];
const outside = rays.map(ray => new Or(digits.map(n => new And([
  new Given(ray[0],n), ...prefixRules(ray,n)
]))));
const layers = digits.map(c => graph.makeOverlay('V' + String.fromCharCode(64+c)));
// States remember the grid digit and whether any region already claimed this cell.
// Zero means outside a region; a claim must copy the digit and may occur only once.
const membership = NFA.encodeSpec({
  startState: {digit: null, claimed: false},
  transition: (s,v) => {
    if (s.digit === null) return v === 0 ? undefined : {digit:v, claimed:false};
    if (v === 0) return s;
    return !s.claimed && v === s.digit ? {digit:s.digit,claimed:true} : undefined;
  },
  accept: s => s.digit !== null,
}, shape);
const regions = layers.flatMap((layer,i) => [
  layer.toVar(`region anchored at R1C${i+1}`),
  new Given(layer.at(makeCellId(1,i+1)), ...digits),
  new ConnectedValues('V' + String.fromCharCode(65+i), digits.join('_')),
  new Sum(0, ...layer.cells(), [makeCellId(1,i+1), -3]),
]);
// Drawn two-cell cages, with their typographic number order.
const cages = [['R6C5','R6C6'],['R8C8','R8C9']];
// Both remainders must be zero, or both must be nonzero.
const cageKey = Pair.fnToKey((a,b) => a > 0 && b > 0 && (((10*a+b)%a===0) === ((10*a+b)%b===0)), shape);
return [shape,
  graph.makeReplicate(new Given('R1C1', ...digits)),
  ...prefixRules(row(1)), ...outside, ...regions,
  ...cells.map(cell => new NFA(membership,'non-overlapping digit masks', [cell,...layers.map(layer => layer.at(cell))])),
  ...cages.map(cage => new Pair(cageKey,'both or neither divisor',...cage)),
];
