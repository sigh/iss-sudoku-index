// Title: Dutch Chocolate Banabner
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=kN9jqnTnNps
// Source: https://sudokupad.app/a48228snwx?setting-nogrid=1

// Normal Sudoku; chocolate components are rectangles with Dutch differences;
// banana components are nonrectangles with distinct nonconsecutive digits.
// Circled digits count their component's cells.
const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const cells = graph.cells();
const CHOC = 1, BANANA = 2;
// Yellow size-circle positions in the drawing (duplicate paint layers count once).
const circles = ['R1C1','R1C3','R1C8','R2C3','R3C1','R3C2','R3C3',
 'R4C6','R5C3','R5C7','R5C9','R6C2','R6C9','R8C4','R9C1'];
// The predicate applies to every pair, including nonadjacent banana cells.
const spaced = Pair.fnToKey((a,b) => Math.abs(a-b) >= 2, shape);
const boundary = region => [...new Set(region.flatMap(c => graph.neighbours(c)))]
 .filter(c => !region.includes(c));
const isRectangle = region => {
 const coords = region.map(parseCellId);
 return (Math.max(...coords.map(p=>p.row))-Math.min(...coords.map(p=>p.row))+1)
  *(Math.max(...coords.map(p=>p.col))-Math.min(...coords.map(p=>p.col))+1) === region.length;
};
// At most five mutually nonconsecutive digits fit in 1..9. Generate every
// connected candidate up to that bound, without solving for a partition.
let level = new Map(cells.map(c => [c,[c]]));
const bananas = [];
for (let size=1; size<=5; size++) {
 bananas.push(...[...level.values()].filter(s => !isRectangle(s)));
 const next = new Map();
 if(size<5) for(const region of level.values()) for(const c of boundary(region)) {
  const grown = [...region,c].sort(); next.set(grown.join(','),grown);
 }
 level=next;
}
const bananaBranch = region => new And([
 ...shade.at(region).map(c => new Given(c,BANANA)),
 ...shade.at(boundary(region)).map(c => new Given(c,CHOC)),
 new PairX(spaced,'Banana digits',...region),
 ...region.filter(c=>circles.includes(c)).map(c=>new Given(c,region.length)),
]);
const bananaBranches = bananas.map(bananaBranch);
const bananaRules = cells.map(c => new Or([
 new Given(shade.at(c),CHOC),
 ...bananas.flatMap((s,i)=>s.includes(c)?[bananaBranches[i]]:[]),
]));
// A component is rectangular iff no 2x2 has precisely three chocolate cells.
const rectangular = cells.flatMap(c => {
 const {row,col}=parseCellId(c); if(row===9||col===9)return [];
 const block=[c,makeCellId(row,col+1),makeCellId(row+1,col),makeCellId(row+1,col+1)];
 return block.map((outside,i)=>new Or([
  new Given(shade.at(outside),CHOC),
  ...block.filter((_,j)=>i!==j).map(x=>new Given(shade.at(x),BANANA)),
 ]));
});
const dutch = cells.flatMap(a => graph.neighbours(a).filter(b=>a<b).map(b=>new Or([
 new Given(shade.at(a),BANANA),new Given(shade.at(b),BANANA),new Whisper(4,a,b),
])));
// A chocolate circle's component must be one of every containing rectangle
// of area 1..9; boundary pins make the chosen rectangle maximal.
const chocolateCircles = circles.map(c => {
 const {row,col}=parseCellId(c); const candidates=[];
 for(let top=1;top<=row;top++)for(let bottom=row;bottom<=9;bottom++)
 for(let left=1;left<=col;left++)for(let right=col;right<=9;right++) {
  const area=(bottom-top+1)*(right-left+1);if(area>9)continue;
  const region=Array.from({length:bottom-top+1},(_,i)=>
   Array.from({length:right-left+1},(_,j)=>makeCellId(top+i,left+j))).flat();
  candidates.push(new And([
   new Given(c,area),...shade.at(region).map(x=>new Given(x,CHOC)),
   ...shade.at(boundary(region)).map(x=>new Given(x,BANANA)),
  ]));
 }
 return new Or([new Given(shade.at(c),BANANA),...candidates]);
});
return [shape,shade.toVar('Chocolate or banana'),
 shade.makeReplicate(new Given(shade.at('R1C1'),CHOC,BANANA)),
 ...rectangular,...dutch,...bananaRules,...chocolateCircles];
