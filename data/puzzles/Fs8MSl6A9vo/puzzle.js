// Title: CtC
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Fs8MSl6A9vo
// Source: https://sudokupad.app/25vrx4x793

// Standard Sudoku; every coloured three-cell line has product 72.
// Every straight three-cell window avoids three consecutive digits in any order.
const shape = new Shape('9x9');

// The three printed givens.
const givens = [new Given('R1C6', 5), new Given('R8C7', 6), new Given('R9C3', 3)];
// The six mauve strokes followed by the five green strokes.
const lines = [
 ['R7C2','R8C2','R9C2'], ['R8C7','R8C8','R8C9'],
 ['R4C6','R4C5','R4C4'], ['R6C4','R6C5','R6C6'],
 ['R1C1','R2C1','R3C1'], ['R1C7','R1C8','R1C9'],
 ['R2C1','R2C2','R2C3'], ['R9C1','R9C2','R9C3'],
 ['R4C4','R5C4','R6C4'], ['R1C8','R2C8','R3C8'],
 ['R7C9','R8C9','R9C9'],
];
const products = [];
for (let a=1;a<=9;a++) for (let b=1;b<=9;b++) for (let c=1;c<=9;c++) {
 if (a*b*c === 72) products.push(`${a}${b}${c}`);
}
const productLines = lines.map(cells => new Regex(`(${products.join('|')})`, ...cells));
// The state retains the first two digits; the third transition rejects precisely
// distinct triples whose maximum minus minimum is two. State 'done' accepts.
const spec = NFA.encodeSpec({
 startState: {digits: []},
 transition: (state, v) => {
  if (state.done) return undefined;
  const digits = [...state.digits, v];
  if (digits.length < 3) return {digits};
  if (new Set(digits).size === 3 && Math.max(...digits)-Math.min(...digits) === 2) return undefined;
  return {done:true};
 },
 accept: state => state.done === true,
 maxDepth:3,
}, shape);
const geometry = cellGeometry(shape);
const windows = [[0,1],[1,0],[1,1],[1,-1]].map(([dr,dc]) => {
 const origin = dc < 0 ? 'R1C3' : 'R1C1';
 const startCol = dc < 0 ? 3 : 1;
 const template = [0,1,2].map(i=>makeCellId(1+i*dr,startCol+i*dc));
 const targets = Array.from({length:81}, (_,i)=>[Math.floor(i/9)+1,i%9+1])
  .filter(([r,c])=>r+2*dr<=9 && c+2*dc>=1 && c+2*dc<=9)
  .map(([r,c])=>makeCellId(r,c));
 return new Replicate([new NFA(spec,'No consecutive triple',template)],
  Replicate.encodeTargetCells(targets,origin,geometry),origin);
});
return [shape, ...givens, ...productLines, ...windows];
