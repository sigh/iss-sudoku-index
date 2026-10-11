// Title: FEEDING FRIENDSy: Fintastic Voyage
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=9UgDKKsDW8c
// Source: https://sudokupad.app/udeje6c23i

// Normal sudoku; seaweed and urchin relations on the marked pairs only.
// Find a simple, noncrossing orthogonal/diagonal route from dolphin to fish,
// avoiding coral edges and coral corners. Each diagonal needs a clear 2x2.
// Route digits decrease except on entry to a bubble or row 1; a visit to
// row 1 must immediately return to water. The fish is not a reset cell.
const graph = cellGraph('9x9');
const cells = graph.cells();
const prev = graph.makeOverlay('VP');
const next = graph.makeOverlay('VN');
const pos8 = graph.makeOverlay('VA');
const pos11 = graph.makeOverlay('VB');
const START = 'R8C1', END = 'R9C8', OFF = 9;
const digits = [1,2,3,4,5,6,7,8,9];
// Codes 1..8 are N, NE, E, SE, S, SW, W, NW; 9 is no edge.
const directions = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
const reverse = code => ((code + 3) % 8) + 1;
const pair = (fn, label, a, b) => new Pair(Pair.fnToKey(fn, 12), label, a, b);

// Coral centreline strokes, transcribed from the thick salmon wall drawing.
const walls = [[[5,0],[5,1]],[[3,0],[3,1]],[[7,4],[7,3.333],[7,5]],[[7,3.333],[7,3],[8,3]],[[7,2],[7,3],[6,3]],[[5,2],[5,3],[4,3],[4,4]],[[4,3],[3,3],[3,2],[2,2],[2,4]],[[3,4],[3,5],[5,5]],[[3,5],[1,5],[1,3]],[[5,6],[2,6]],[[2,7],[6,7],[6,6],[8,6],[8,5]],[[6,6.333],[6,5]],[[5,8],[6,8]],[[6,4],[5,4]]];
// Every rounded coral spot is drawn data, including isolated corner spots.
const coralCorners = [[5,2],[5,1],[6,3],[6,5],[6,8],[5,8],[2,8],[3,1],[1,3],[2,4],[3,4],[4,4],[5,5],[2,6],[5,6],[2,7],[8,3],[7,5],[8,5],[5,4],[6,4],[8,7],[7,8],[7,2],[1,5],[3,0],[5,0],[6,7],[8,6],[5,3],[3,3],[3,2],[2,2]];
// The five clusters of bubbles mark these reset cells.
const bubbles = new Set(['R3C6','R3C8','R4C4','R5C7','R7C8']);
// The fourteen green seaweed clusters and three black urchins mark these pairs.
const seaweed = [["R4C1","R5C1"],["R4C3","R5C3"],["R6C1","R7C1"],["R7C1","R7C2"],["R6C2","R7C2"],["R8C2","R9C2"],["R6C3","R7C3"],["R7C5","R7C6"],["R8C7","R9C7"],["R2C6","R2C7"],["R2C7","R2C8"],["R2C8","R2C9"],["R3C9","R4C9"],["R4C9","R5C9"]];
const urchins = [["R8C3","R9C3"],["R8C4","R9C4"],["R3C8","R3C9"]];

const pointKey = (r,c) => r + ',' + c;
const blockedCorners = new Set(coralCorners.map(([r,c]) => pointKey(r,c)));
const edgeKey = (a,b) => [a,b].sort().join('|');
const blockedEdges = new Set();
for (const stroke of walls) {
  for (let i = 1; i < stroke.length; i++) {
    const [r1,c1] = stroke[i-1], [r2,c2] = stroke[i];
    if (r1 === r2) {
      for (let c = Math.ceil(Math.min(c1,c2)); c <= Math.floor(Math.max(c1,c2)); c++)
        blockedCorners.add(pointKey(r1,c));
      for (let c = Math.floor(Math.min(c1,c2)); c < Math.ceil(Math.max(c1,c2)); c++)
        if (r1 > 0 && r1 < 9) blockedEdges.add(edgeKey(makeCellId(r1,c+1),makeCellId(r1+1,c+1)));
    } else {
      for (let r = Math.ceil(Math.min(r1,r2)); r <= Math.floor(Math.max(r1,r2)); r++)
        blockedCorners.add(pointKey(r,c1));
      for (let r = Math.floor(Math.min(r1,r2)); r < Math.ceil(Math.max(r1,r2)); r++)
        if (c1 > 0 && c1 < 9) blockedEdges.add(edgeKey(makeCellId(r+1,c1),makeCellId(r+1,c1+1)));
    }
  }
}
const moves = cell => {
  const {row,col} = parseCellId(cell);
  return directions.flatMap(([dr,dc], i) => {
    const dest = graph.step(cell,dr,dc);
    if (!dest || blockedEdges.has(edgeKey(cell,dest))) return [];
    if (dr && dc && blockedCorners.has(pointKey(row - (dr < 0 ? 1 : 0), col - (dc < 0 ? 1 : 0)))) return [];
    return [{dest,code:i+1}];
  });
};
const allMoves = cells.flatMap(cell => moves(cell).map(move => ({cell,...move})));
const domains = cells.flatMap(cell => {
  const outgoing = moves(cell).filter(({dest}) => !(parseCellId(cell).row === 1 && parseCellId(dest).row === 1)).map(({code}) => code);
  const incoming = moves(cell).filter(({dest}) => !(parseCellId(dest).row === 1 && parseCellId(cell).row === 1)).map(({code}) => code);
  return [new Given(prev.at(cell), ...(cell === START ? [OFF] : cell === END ? incoming : [OFF,...incoming])),
          new Given(next.at(cell), ...(cell === END ? [OFF] : cell === START ? outgoing : [OFF,...outgoing]))];
});
// A body cell has one predecessor and one different successor, or is unused.
const bodyRules = cells.filter(cell => cell !== START && cell !== END).map(cell =>
  pair((p,n) => (p === OFF && n === OFF) || (p !== OFF && n !== OFF && p !== n), 'body', prev.at(cell),next.at(cell)));
// Matching pointers identify the same directed step at both ends.
const agreement = allMoves.map(({cell,dest,code}) =>
  pair((s,p) => (s === code) === (p === reverse(code)), 'step-agreement', next.at(cell),prev.at(dest)));
// Position residues increment on used steps. Coprime 8 and 11 have lcm 88,
// above the 81-cell maximum cycle, so disconnected subtours cannot survive.
// An unused cell holds the separate sentinel MOD+1 on each position layer.
const positions = cells.flatMap(cell => {
  const active = cell === END ? prev.at(cell) : next.at(cell);
  return [pair((s,a) => (s === OFF) === (a === 9), 'position-8-membership',active,pos8.at(cell)),
          pair((s,b) => (s === OFF) === (b === 12), 'position-11-membership',active,pos11.at(cell))];
});
const stepRules = allMoves.flatMap(({cell,dest,code}) => {
  const unused = new Given(next.at(cell),...digits.filter(d => d !== code));
  const resets = bubbles.has(dest) || parseCellId(dest).row === 1;
  return [new Or([unused,pair((a,b) => b === a % 8 + 1, 'position-8-step',pos8.at(cell),pos8.at(dest))]),
          new Or([unused,pair((a,b) => b === a % 11 + 1, 'position-11-step',pos11.at(cell),pos11.at(dest))]),
          ...(!resets ? [new Or([unused,pair((a,b) => a > b,'oxygen-descent',cell,dest)])] : [])];
});
// The two diagonals of a 2x2 cannot both be used, in either orientation.
const crossingTemplate = [['R1C1',4],['R2C2',8]].flatMap(([a,da]) => [['R1C2',6],['R2C1',2]].map(([b,db]) =>
  pair((x,y) => x !== da || y !== db,'no-crossing',next.at(a),next.at(b))));
const crossingOrigins = cells.filter(cell => {
  const {row,col}=parseCellId(cell);
  return row < 9 && col < 9;
});
const crossings = new Replicate(crossingTemplate,
  Replicate.encodeTargetCells(next.at(crossingOrigins),next.at('R1C1'),next),next.at('R1C1'));
const positionDomain = new Replicate([new Given(pos8.at('R1C1'),...digits)],
  Replicate.encodeTargetCells(pos8.at(cells),pos8.at('R1C1'),pos8),pos8.at('R1C1'));

return [
  new Shape('9x9','1-12'),
  graph.makeReplicate(new Given('R1C1',...digits)),
  prev.toVar('predecessor'), next.toVar('successor'),
  pos8.toVar('position modulo 8'),pos11.toVar('position modulo 11'),
  ...seaweed.map(([a,b]) => new Whisper(5,a,b)),
  ...urchins.map(([a,b]) => new BlackDot(a,b)),
  ...domains,...bodyRules,...agreement,positionDomain,...positions,
  new Given(pos8.at(START),1),new Given(pos11.at(START),1),
  ...stepRules,crossings,
];
