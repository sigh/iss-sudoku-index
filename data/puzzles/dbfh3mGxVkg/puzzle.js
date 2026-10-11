// Title: Not Constraints
// Author: Derek LeClair
// Video: https://www.youtube.com/watch?v=dbfh3mGxVkg
// Source: https://sudokupad.app/u5f00lj0dt

// Normal Sudoku; red adjacent digits have equal parity; thermometers do not
// increase from their bulbs; peach triples omit at least one entropy band;
// gray interiors are not strictly between their endpoints; every digit occurring
// on either blue diagonal repeats there; black dots forbid doubling, white dots
// forbid consecutive digits, and X marks forbid a sum of ten. No rules omitted.
const shape = new Shape('9x9');
// Drawn red paths, bulb-first thermometer paths, peach paths and gray paths.
const red = [
  ['R1C3','R1C2','R1C1','R2C1','R3C1'],
  ['R7C3','R8C3','R9C3','R9C2'],
  ['R7C2','R8C2'], ['R7C7','R7C8','R8C8'],
];
const thermos = [
  ['R2C8','R2C7','R2C6','R2C5','R2C4','R2C3'],
  ['R3C2','R4C2','R5C2','R6C2'],
];
const peach = [
  ['R4C1','R5C1','R6C1'], ['R6C7','R5C7','R4C8'],
  ['R8C6','R8C5','R7C5'],
];
const gray = [
  ['R6C2','R6C3','R6C4','R6C5','R6C6','R5C6','R4C6','R3C6','R2C6'],
  ['R2C9','R3C9','R4C9','R5C9','R6C9','R7C9','R8C9','R9C9'],
];
// Drawn black dots, white dots and X marks.
const black = [['R2C3','R3C3'],['R6C6','R6C7']];
const white = [
  ['R2C6','R2C7'],['R1C9','R2C9'],['R7C6','R7C7'],
  ['R8C6','R9C6'],['R6C8','R6C9'],['R8C8','R9C8'],
  ['R3C7','R3C8'],['R4C5','R5C5'],
];
const xs = [['R2C2','R3C2'],['R9C4','R9C5'],['R2C7','R3C7']];
// The blue ink makes two straight corner-to-corner diagonals crossing at R5C5.
// The rules call them diagonal lines; the spoken explanation allows pairs and
// triples and requires all occurring digits to repeat on their own diagonal.
const diagonals = [
  [1,2,3,4,5,6,7,8,9].map(r => makeCellId(r,r)),
  [1,2,3,4,5,6,7,8,9].map(r => makeCellId(r,10-r)),
];
// Pair predicates express only the named local relation, with equality allowed
// by the wording "must not increase".
const parity = Pair.fnToKey((a,b) => a%2 === b%2, shape);
const decreasing = Pair.fnToKey((a,b) => a >= b, shape);
const noDouble = Pair.fnToKey((a,b) => a !== 2*b && b !== 2*a, shape);
const noConsecutive = Pair.fnToKey((a,b) => Math.abs(a-b) !== 1, shape);
const noTen = Pair.fnToKey((a,b) => a+b !== 10, shape);
// The bitmask records which of the three entropy bands have appeared.
const notEntropy = NFA.encodeSpec({
  startState:0,
  transition:(mask,v) => { const next = mask | (1 << Math.floor((v-1)/3)); return next === 7 ? undefined : next; },
  accept:() => true,
}, shape);
// First read both endpoint values, then reject any interior strictly between
// them. Equality with an endpoint is permitted by "must not be between".
const notBetween = NFA.encodeSpec({
  startState:{phase:0,a:0,b:0},
  transition:(s,v) => {
    if (s.phase === 0) return {phase:1,a:v,b:0};
    if (s.phase === 1) return {phase:2,a:Math.min(s.a,v),b:Math.max(s.a,v)};
    return v > s.a && v < s.b ? undefined : s;
  },
  accept:s => s.phase === 2,
}, shape);
// Each digit's occurrence count saturates at two; a final count of one fails.
const repeatSpecs = Array.from({length:9}, (_,i) => NFA.encodeSpec({
  startState:0,
  transition:(count,v) => Math.min(2,count+(v === i+1 ? 1 : 0)),
  accept:count => count !== 1,
}, shape));
return [
  shape,
  ...red.map(cells => new Pair(parity,'Same parity',...cells)),
  ...thermos.map(cells => new Pair(decreasing,'Nonincreasing',...cells)),
  ...peach.map(cells => new NFA(notEntropy,'Not entropic',cells)),
  ...gray.map(cells => new NFA(notBetween,'Not between',[cells[0],cells[cells.length-1],...cells.slice(1,-1)])),
  ...diagonals.flatMap(cells => repeatSpecs.map((spec,i) => new NFA(spec,'Repeat '+(i+1),cells))),
  ...black.map(cells => new Pair(noDouble,'Not double',...cells)),
  ...white.map(cells => new Pair(noConsecutive,'Not consecutive',...cells)),
  ...xs.map(cells => new Pair(noTen,'Not ten',...cells)),
];
