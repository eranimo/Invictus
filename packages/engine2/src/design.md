# Architecture

## Classes
- Game
- Scene
- Entity
- Attribute
- Behavior

Attributes do not use any other components (neither other attributes, nor behaviors), they are self sufficient.
Behaviors do not use or know about other behaviors. They only know about some of the attributes (those that they strictly need).
