// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YqjJ7UV3IZs
// Source: https://git.io/JUgwF

// White cells are empty (0) or digits 1-9. Each clued strip sums to its
// total, with nonzero digits distinct. Empty cells form one simple orthogonal
// loop; adjacency without a used edge is allowed. Grey cells are excluded.
const shape = new Shape('12x16', '0-15', 'Raw');
const graph = cellGraph(shape);
// Grey cells and split-cell totals transcribed from the Kakuro board.
const grey = [[1, 1], [1, 5], [1, 6], [1, 7], [1, 8], [1, 12], [2, 3], [2, 12], [3, 9], [3, 14], [4, 1], [4, 2], [4, 4], [4, 15], [5, 6], [5, 8], [5, 10], [5, 13], [7, 10], [7, 13], [8, 1], [8, 6], [8, 7], [8, 16], [10, 3], [10, 8], [10, 11], [10, 14], [10, 15], [12, 2], [12, 6]];
const clues = [[1, 1, "H", 0], [1, 1, "V", 4], [1, 5, "V", 10], [1, 6, "V", 3], [1, 7, "V", 24], [1, 8, "H", 5], [1, 8, "V", 3], [1, 12, "H", 0], [2, 3, "H", 8], [2, 3, "V", 0], [2, 12, "H", 1], [2, 12, "V", 17], [3, 9, "V", 30], [3, 14, "V", 9], [4, 1, "V", 0], [4, 2, "H", 0], [4, 2, "V", 22], [4, 4, "V", 9], [5, 6, "V", 14], [5, 8, "V", 9], [5, 10, "H", 4], [5, 10, "V", 7], [5, 13, "H", 0], [5, 13, "V", 3], [7, 10, "H", 5], [7, 10, "V", 1], [7, 13, "H", 2], [8, 1, "H", 5], [8, 1, "V", 2], [8, 6, "V", 8], [8, 7, "H", 24], [8, 7, "V", 10], [8, 16, "V", 12], [10, 3, "H", 22], [10, 8, "H", 9], [10, 14, "V", 0], [10, 15, "V", 3], [11, 5, "H", 9], [12, 2, "H", 5]];
// Every diagonal clue box is grey, including R11C5 with no separate fill.
const blocked = new Set([...grey,...clues.map(([r,c])=>[r,c])].map(([r,c]) => makeCellId(r,c)));
const cells = graph.cells();
const white = cells.filter(c => !blocked.has(c));
const route = new Var('D', 'directed loop shape', '12x16');
const residues = [new Var('A', 'position mod 13', '12x16'),
                  new Var('B', 'position mod 15', '12x16')];
const index = c => { const {row,col}=parseCellId(c); return (row-1)*16+col; };
const aux = (v,c) => v.cell(index(c));
const moves = [[-1,0],[0,1],[1,0],[0,-1]];
// Code 0 is off-route; each other code names distinct incoming/outgoing sides.
const codes = [[-1,-1], ...moves.flatMap((_,a) => moves.map((_,b) => [a,b]).filter(x=>x[0]!==x[1]))];
const seam = makeCellId(1,2);
const domain = cells.flatMap(c => [new Given(c,...(blocked.has(c)?[0]:[0,1,2,3,4,5,6,7,8,9])),
 new Given(aux(route,c),...codes.map((_,i)=>i).filter(i=>!blocked.has(c) ? i===0 || codes[i].every(d=>{const n=graph.step(c,...moves[d]);return n&&!blocked.has(n);}) : i===0))]);
// Empty iff on-route; blocked cells remain off-route.
const membershipKey = Pair.fnToKey((digit,code)=>(digit===0)===(code!==0),shape);
const membership = white.map(c=>new Pair(membershipKey,'empty on loop',c,aux(route,c)));
const distinctKey = Pair.fnToKey((a,b)=>a===0||b===0||a!==b,shape);
const sums = clues.flatMap(([r,c,d,total])=>{
 const run=[]; let n=graph.step(makeCellId(r,c),...(d==='H'?[0,1]:[1,0]));
 while(n&&!blocked.has(n)){run.push(n);n=graph.step(n,...(d==='H'?[0,1]:[1,0]));}
 return [new Sum(total,...run),new PairX(distinctKey,'distinct digits',...run)];
});
const edgeAgreement = white.flatMap(c=>moves.slice(1,3).flatMap((delta,j)=>{
 const d=j+1,n=graph.step(c,...delta); if(!n||blocked.has(n))return [];
 // Each used outgoing side matches the neighbour's incoming opposite side.
 const key=Pair.fnToKey((a,b)=>a<codes.length && b<codes.length && ((codes[a][1]===d)===(codes[b][0]===(d+2)%4) &&
 (codes[a][0]===d)===(codes[b][1]===(d+2)%4)),shape);
 return [new Pair(key,'directed edge agreement',aux(route,c),aux(route,n))];
}));
// R1C2 is forced empty by the zero across clue. Choosing its smaller outgoing
// side fixes the two orientations. Residues start at 0 there and increment
// on every directed step except the return to this seam. A separate cycle
// would have length divisible by lcm(13,15)=195, exceeding 160 white cells.
const seamRules = [new Given(aux(route,seam),...codes.map((x,i)=>i).filter(i=>i && codes[i][1]<codes[i][0])),
 ...residues.map(v=>new Given(aux(v,seam),0))];
const positionDomains = residues.flatMap((v,k)=>cells.map(c=>new Given(aux(v,c),...(blocked.has(c)?[15]:[...Array(k?15:13).keys(),15]))));
const positionMembership = residues.flatMap(v=>cells.map(c=>new Pair(Pair.fnToKey((code,pos)=>(code===0)===(pos===15),shape),'off route sentinel',aux(route,c),aux(v,c))));
const steps = white.flatMap(c=>moves.flatMap((delta,d)=>{
 const n=graph.step(c,...delta);if(!n||blocked.has(n)||n===seam)return [];
 const inactive=codes.map((_,i)=>i).filter(i=>codes[i][1]!==d);
 return residues.map((v,k)=>new Or([new Given(aux(route,c),...inactive),new Pair(Pair.fnToKey((a,b)=>a!==15 && b===(a+1)%(k?15:13),shape),'next position',aux(v,c),aux(v,n))]));
}));
// Repeated restrictions and edge agreements are stamped within their own layer.
const compress = (items, layer) => {
 const groups = new Map();
 for(const item of items){
  const origin = item.type==='Given' ? item.cell : item.cells[0];
  const args = item.type==='Given' ? item.values.join(',') : item.key + ':' + (index(layer.gridAt(item.cells[1]))-index(layer.gridAt(origin)));
  if(!groups.has(args))groups.set(args,[]);
  groups.get(args).push(item);
 }
 return [...groups.values()].map(group=>{const origin=group[0].type==='Given'?group[0].cell:group[0].cells[0];const targets=group.map(item=>item.type==='Given'?item.cell:item.cells[0]);return new Replicate([group[0]],Replicate.encodeTargetCells(targets,origin,layer),origin);});
};
const digitGroups = [graph.makeReplicate(new Given(cells[0],0,1,2,3,4,5,6,7,8,9)),
 ...cells.filter(c=>blocked.has(c)).map(c=>new Given(c,0))];
const routeLayer=graph.makeOverlay('VD');
const routeDomains=[routeLayer.makeReplicate(new Given(aux(route,cells[0]),...codes.map((_,i)=>i))),
 ...domain.filter(x=>x.cell[0]!=='R' && x.values.length<codes.length)];
const residueDomains=residues.flatMap((v,k)=>[
 graph.makeOverlay('V'+v.prefix).makeReplicate(new Given(aux(v,cells[0]),...[...Array(k?15:13).keys(),15])),
 ...cells.filter(c=>blocked.has(c)).map(c=>new Given(aux(v,c),15))]);
return [shape,route,...residues,...digitGroups,...routeDomains,...membership,...sums,...compress(edgeAgreement,routeLayer),
 ...seamRules,...residueDomains,...positionMembership,...steps];
