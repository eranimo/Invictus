# Architecture

## Classes
- Game: maintains game loop
  - Scene: handles entities
    - Grid: 2D grid of entity arrays
- Entity
  - EntityAttribute
  - EntityBehavior
- TileRenderer: renders the game
  - TileMap: 2d grid of tile sprites
  - TileSet: map of tile names to tile textures

Attributes do not use any other components (neither other attributes, nor behaviors), they are self sufficient.
Behaviors do not use or know about other behaviors. They only know about some of the attributes (those that they strictly need).


## Things

### Attributes
- [x] TileAttribute: tileID, colors, rotation
- [x] GridPositionAttribute: x, y
- [ ] HealthAttribute: current_health, max_health

### Behaviors
- GridInputBehavior: listens to grid input event
- ColonistAIBehavior: colonist AI
- GridInputBehavior: click events from grid
- GridSelectableBehavior: allows entity to be selectable

### Entities

- Terrain
  - TileAttribute
  - GridPositionAttribute

- Building
  - TileAttribute
  - HealthAttribute
  - GridPositionAttribute
  - GridSelectableBehavior

- Item
  - TileAttribute
  - GridPositionAttribute
  - GridSelectableBehavior

- Colonist
  - TileAttribute
  - GridPositionAttribute
  - ColonistAIBehavior
  - HealthAttribute
  - GridInputBehavior
  - GridSelectableBehavior



# New Design

## Classes
- World: contains Scenes
- Scene: handles entities, assets
- Entity: mapping of ID number to list of components
- Component: dumb components containing a specific interface, observable
- Group: Groups of Entities containing specific components, observable
- System: iterates over groups, source of all game logic
- Prefab:


## Components
- Resource
  - type: enum
  - url: string
  - name: string
- Motion
  - where: vector
  - speed: number
- Position
  - x: number
  - y: number
  - z: number
- Tile
  - tileID: string
  - tilesetID:

## Systems
- TilemapSystem: Tile
- MotionSystem:
