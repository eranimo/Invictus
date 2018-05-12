import {
  EntityManager,
  Coordinate
} from '@invictus/engine';
import {
  UIComponent,
  TileComponent,
  GridPositionComponent
} from '@invictus/engine/components';


export default function colonistFactory(
  settings: {
    name: string,
  },
  entityManager: EntityManager
): number {
  const entityID = entityManager.createEntity();
  entityManager.addComponent(entityID, 'UIComponent', { name, isVisible: true, isSelectable: true })
  entityManager.addComponent(entityID, 'TileComponent', {
    tileset: 'tileset',
    tileName: 'smile',
    layer: 1,
    colorReplacements: [
      [[255, 255, 255], [231, 121, 129]],
      [[0, 0, 0], [231 - 50, 121 - 100, 129 - 100]],
    ],
    rotation: 0,
  });
  entityManager.addComponent(entityID, 'GridPositionComponent', { x: 1, y: 1 });
  return entityID;
}
