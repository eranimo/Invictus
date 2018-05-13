# Design

## Classes
- Game: contains Scenes, TileRenderer
- Scene: handles entities, assets, systems
- Component: dumb components containing a specific interface, observable
- Group: Groups of Entities containing specific components, observable
- System: iterates over a group, runs a function on each entity every tick
- ReactiveSystem: listens for changes to a Group, reacts to changes to specific components
- Prefab: creates entities of a certain configuration
- TileRenderer
  - contains viewport
  - handles viewport events
  - stores tilesets
- GridUI: handles selected cells, hover cell


## Maxims
- Components only hold serializable data
- Systems do not reference each other


## Components
- Resource
  - type: enum
  - url: string
  - name: string
- Motion
  - where: vector
  - speed: number
- GridPosition
  - x: number
  - y: number
  - z: number
- Tile
  - tileID: string
  - tilesetID:

## Reactive Systems
- TileMap: Renders a grid of tile sprites
- GameGrid: logic grid of components, listens for GridPosition changes
