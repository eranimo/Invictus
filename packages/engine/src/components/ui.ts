import EntityAttribute from '@invictus/engine/core/entityAttribute';


export interface UISettings {
  name: string;
  isVisible: boolean;
  isSelectable: boolean;
}
export class UIAttribute extends EntityAttribute<UISettings> {}
