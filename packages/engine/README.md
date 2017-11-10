# Engine

## Architecture

### Concepts

- Entity
  - is a collection of component instances
  - has an ID
- Component
  - has a type
  - has serializable properties
  - takes properties as input
- Blueprint
  - describes how entites will be initialized
  - contains a property list for each component
- Action
  - a change in state of a component
- System
- Manager: 
