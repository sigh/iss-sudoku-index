// Title: Chaos Construction: Region Sum Rows
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=-FBs5D3GiII
// Source: https://sudokupad.app/yo9wdwnp03

// Rows, columns and discovered connected eight-cell regions contain 1-8.
// Arrow arms sum to their bulbs. Contiguous region segments in each row
// have equal totals. Every horizontal grid cut has a same-region crossing.
const shape = new Shape('8x8');

const cc = cellGraph('8x8').makeOverlay('CC');
const regionCell = (r,c) => { const cell = makeCellId(r,c); return cc.at(cell); };
// The eight drawn arrow bulbs followed by their arm cells.
const arrows = [
 ['R1C2','R1C3','R1C4'], ['R2C7','R1C7','R1C6'],
 ['R4C6','R5C5','R6C4'], ['R7C1','R7C2','R6C1'],
 ['R8C1','R8C2','R7C3'], ['R7C7','R8C6','R8C5'],
 ['R5C6','R4C5','R3C5'], ['R2C5','R3C4','R4C3','R3C2'],
];
const flags = new Var('B', 'Horizontal region borders', '8x7');
// A border flag is 1 for equal labels, 2 for different labels.
const border = NFA.encodeSpec({
 startState: {p:0},
 transition: (s,v) => s.p===0 ? {p:1,a:v} :
  s.p===1 ? (v<=2 ? {p:2,a:s.a,f:v}:undefined) :
  s.p===2 && ((s.a===v) === (s.f===1)) ? {p:3}:undefined,
 accept:s=>s.p===3,
}, shape);
// Each row totals 36, so a common segment total divides 36 and is at
// least 8 (the segment containing digit 8). State tracks target, subtotal,
// and whether the next input is a digit or border flag.
const rowSpec = NFA.encodeSpec({
 startState:[9,12,18,36].map(t=>({t,s:0,p:0})),
 transition:(s,v)=>{
  if(s.p===0) return s.s+v<=s.t ? {t:s.t,s:s.s+v,p:1}:undefined;
  if(v===1) return {t:s.t,s:s.s,p:0};
  if(v===2 && s.s===s.t) return {t:s.t,s:0,p:0};
 },
 accept:s=>s.p===1 && s.s===s.t,
},shape);
const rows = Array.from({length:8},(_,i)=>i+1);
const cols = rows;
const borderLinks = rows.flatMap(r=>cols.slice(0,7).map(c=>
 new NFA(border,'Region border',regionCell(r,c),flags.cell(r,c),regionCell(r,c+1))));
const rowSums = rows.map(r=>new NFA(rowSpec,'Equal row segment sums',
 ...cols.flatMap(c=>c<8 ? [makeCellId(r,c),flags.cell(r,c)] : [makeCellId(r,c)])));
const cuts = rows.slice(0,7).map(r=>new Or(cols.map(c=>
 new SameValues(2,regionCell(r,c),regionCell(r+1,c)))));
return [shape,new NoBoxes(),new ChaosConstruction(),flags,
 ...arrows.map(cells=>new Arrow(...cells)),...borderLinks,...rowSums,...cuts];
