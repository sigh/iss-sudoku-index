// Title: Loopy Tiles
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=ulf2V1BtkGs
// Source: https://sudokupad.app/zusdr2z05v

// Normal 6x6 sudoku. Unrotated tiles cover the board and form a single
// orthogonal blue loop. Circled digits count their cell's tile type across
// the board. Yellow dots prohibit consecutive digits and loop crossings.
const shape = new Shape('6x6', 7);
const graph = cellGraph('6x6');
const cells = graph.cells();
const tiles = new Var('T', 'Tile type', '6x6');
const network = new Var('L', 'Subdivided loop', '11x11');
const loopGraph = cellGraph('11x11').makeOverlay('VL');
// Legend, left to right: NE, ES, SW, WN, EW, NS, blank.
const masks = [0, 3, 6, 12, 9, 10, 5, 0];
const N = 1, E = 2, S = 4, W = 8;
const tile = c => { const p = parseCellId(c); return tiles.cell(p.row, p.col); };
const key = fn => Pair.fnToKey(fn, shape);
// A network vertex is on precisely when its tile has a blue stroke.
const nodeKey = key((t, b) => b === (t === 7 ? 1 : 2));
// A bridge is on precisely when the tile uses the side toward that bridge.
const bridgeKey = bit => key((t, b) => b === ((masks[t] & bit) ? 2 : 1));
// Yellow-dot pairs transcribed from the six yellow edge circles.
const dots = [['R2C2','R3C2'],['R1C2','R1C3'],['R4C4','R5C4'],
  ['R4C5','R5C5'],['R6C3','R6C4'],['R2C5','R2C6']];
// Counting-circle cells transcribed from the eleven pale outlined circles.
const circles = ['R2C1','R1C5','R3C2','R4C2','R4C3','R6C1',
  'R5C1','R6C4','R5C4','R5C5','R6C6'];
const domains = cells.map(c => {
  const {row:r,col:s} = parseCellId(c);
  const forbidden = (r===1?N:0)|(r===6?S:0)|(s===1?W:0)|(s===6?E:0);
  return new Given(tile(c), ...[1,2,3,4,5,6,7].filter(t => !(masks[t]&forbidden)));
});
// Odd/odd network cells are board-cell centres. Intermediate cells are
// used-edge bridges; even/even cells are off, so adjacent unjoined strokes
// cannot accidentally connect. Thus network connectivity means loop connectivity.
const nodeRules = cells.map(c => {
  const {row:r,col:s} = parseCellId(c);
  return new Pair(nodeKey, 'stroke membership', tile(c), network.cell(2*r-1,2*s-1));
});
const edgeRules = cells.flatMap(c => {
  const {row:r,col:s} = parseCellId(c);
  return [[0,1,E,W],[1,0,S,N]].flatMap(([dr,dc,out,back]) => {
    const next = graph.step(c,dr,dc);
    if (!next) return [];
    const bridge = network.cell(2*r-1+dr,2*s-1+dc);
    return [new Pair(bridgeKey(out),'outgoing side',tile(c),bridge),
      new Pair(bridgeKey(back),'incoming side',tile(next),bridge),
      ...(dots.some(([a,b]) => a===c && b===next || a===next && b===c)
        ? [new Given(bridge,1)] : [])];
  });
});
const circleRules = circles.map(c => new Or([1,2,3,4,5,6,7].flatMap(t =>
  [1,2,3,4,5,6].map(n => new And([new Given(tile(c),t),new Given(c,n),
    new ContainExact(Array(n).fill(t).join('_'),...tiles.cells())])))));
return [shape, tiles, network,
  graph.makeReplicate(new Given(cells[0],1,2,3,4,5,6), cells),
  loopGraph.makeReplicate(new Given(network.cell(1),1,2), network.cells()),
  ...Array.from({length:5},(_,r) => Array.from({length:5},(_,c) =>
    new Given(network.cell(2*r+2,2*c+2),1))).flat(),
  ...domains, ...nodeRules, ...edgeRules,
  new ConnectedValues('VL',2),
  ...dots.map(([a,b]) => new Pair(key((x,y) => Math.abs(x-y)!==1),'nonconsecutive',a,b)),
  ...circleRules];
