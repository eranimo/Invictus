# River generation with Fractal Pathfinding

1. Fractal Pathfinding: https://gamedev.stackexchange.com/questions/128170/river-to-nowhere-how-do-i-make-a-pathfinder-move-to-a-destination-that-doesnt
2. Meander geometry: https://divisbyzero.com/2009/11/26/the-geometry-of-meandering-rivers/
- Pick random points in a high altitude (source)
- Find nearest coastal cell (destination)
- river data structure has:
  - source cell
  - destination cell
  - path array of river cells
    - x & y coordinate
    - change in elevation
    - next cell
    - previous cell
  - branch count (default of 1)
- WORLD STEP:
  - Pathfinding:
    find a path from source to destination
    - create a graph where edges go from cells to their lowest neighbor lower than themselves
      - prefer a path closer to the destination (use distance function)
    - if pathfind encounters another river:
      - stop pathfinding
      - increase that river's branchCount by one
      - set destination to this cell
- CHUNK STEP:
  - Pathfinding:
    calculate each river cell in the chunk space
    - use same pathfinding between consecutive cells in the river
      to get a continous path to the destination
  - Polishing:
    for each cell in the river:
    - increase size of river cell in proportion to the branch count
    - lower the terrain around river cells in proportion to:
      - the branch count (lower wider area if number is lower)
      - the change in elevation (lower less area if higher difference)
    - mark cells as flood plains if the change in elevation within 4 cells is less than 2
    - mark cells as sand if they border a river cell that has a change in elevation less than 2

# River generation with cellular flow
- water depth array = 3D array of water levels at each level
  - cells with no water have 0 depth
  - maximum depth value of 7
  - cells with depth values over the maximum are "pressurized"
- cells have neighbors in 6 3D directions
  - up, down, north, south, west, east
- River flow:
  loop over each cell in the 3D water map that has water (depth over 0):
  1. flow downwards:
    if the cell below this cell is clear and has less water than this cell:
      then transfer amount = [my water amount] - [downwards cell water amount]
  2. flow sideways:
    if depth is above 1:
      
  3. flow upwards:
    if cell is pressurized and cell above is clear,
      deposit water over the maximum to the cell above
