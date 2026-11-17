// Title: Chaos Construction: Binary Whisper
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=ppw8JnNcpTw
// Source: https://sudokupad.app/mvk3xv23yc

// Latin square 1-8; eight connected, eight-cell regions on a torus, each
// containing every digit. Drawn boundaries separate regions. Across every
// region boundary, one digit is 1-3 and the other 6-8. Arrow arms sum to bulbs.
const shape = new Shape('8x8');
const graph = cellGraph('8x8');
const cells = graph.cells();
const labels = graph.makeOverlay('VL');
const depths = graph.makeOverlay('VD');
const eqKey = Pair.fnToKey((a,b) => a === b, shape);
const neKey = Pair.fnToKey((a,b) => a !== b, shape);
const stepKey = Pair.fnToKey((a,b) => a === b+1, shape);
const closeKey = Pair.fnToKey((a,b) => Math.abs(a-b) <= 1, shape);
const rootKey = Pair.fnToKey((a,b) => (a === 1) === (b === 1), shape);
const binaryKey = Pair.fnToKey((a,b) => (a<=3 && b>=6)||(b<=3 && a>=6), shape);
const eq = (a,b) => new Pair(eqKey, 'equal', a,b);
const ne = (a,b) => new Pair(neKey, 'different', a,b);
const wrap = n => (n+7)%8+1;
// Toroidal neighbors include the opposite-edge cells.
// lint-ok: custom-neighbour-helper
const neighbors = cell => {
  const {row,col} = parseCellId(cell);
  return [[wrap(row-1),col],[wrap(row+1),col],[row,wrap(col-1)],[row,wrap(col+1)]].map(([r,c])=>makeCellId(r,c));
};
const edges = cells.flatMap(a => {
  const {row,col} = parseCellId(a);
  return [makeCellId(wrap(row+1),col),makeCellId(row,wrap(col+1))].map(b=>[a,b]);
});
// A region is named by the column of its digit 1, removing label permutations.
const roots = cells.map(a => new Pair(Pair.fnToKey((digit,label) => digit!==1 || label===parseCellId(a).col,shape),'root column',a,labels.at(a)));
const sizes = Array.from({length:8},(_,i)=>new ContainExact(Array(8).fill(i+1).join('_'),...labels.cells()));
const distinct = cells.flatMap((a,i)=>cells.slice(i+1).map(b=>new Or([ne(labels.at(a),labels.at(b)),ne(a,b)])));
// Depth 1 is the digit-1 root. Every other cell has a same-region predecessor
// one shallower; edge Lipschitz bounds make depths the unique shortest distances
// plus one. A connected eight-cell region has maximum distance seven.
const connectivity = cells.map(a=>new And([
  new Pair(rootKey,'root depth',a,depths.at(a)),
  new Or([new Given(depths.at(a),1),...neighbors(a).map(b=>new And([eq(labels.at(a),labels.at(b)),new Pair(stepKey,'predecessor',depths.at(a),depths.at(b))]))])
]));
const distances = edges.map(([a,b])=>new Or([ne(labels.at(a),labels.at(b)),new Pair(closeKey,'distance bound',depths.at(a),depths.at(b))]));
const boundaries = edges.map(([a,b])=>new Or([eq(labels.at(a),labels.at(b)),new Pair(binaryKey,'small-large',a,b)]));
// The thick stair-step drawn boundary separates these six cell pairs.
const walls = [['R3C5','R3C6'],['R3C5','R4C5'],['R4C4','R4C5'],['R4C4','R5C4'],['R5C3','R5C4'],['R5C3','R6C3']].map(([a,b])=>new AllDifferent(labels.at(a),labels.at(b)));
// Bulbs and arm paths transcribed from the three grey arrows.
const arrows = [
  new Arrow('R3C3','R4C4','R5C5','R6C6'),
  new Arrow('R7C4','R6C3','R5C3'),
  new Arrow('R6C7','R7C8','R8C8')
];
return [shape,new NoBoxes(),labels.toVar('region'),depths.toVar('distance'),...roots,...sizes,...distinct,...connectivity,...distances,...boundaries,...walls,...arrows];
