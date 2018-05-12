import Component from '@invictus/engine/core/component';


/*
import EntityAttribute from '@invictus/engine/core/entityAttribute';


export interface UISettings {
  name: string;
  isVisible: boolean;
  isSelectable: boolean;
}
export class UIAttribute extends EntityAttribute<UISettings> {}
*/

export interface IUIComponent {
  name: string;
  isVisible: boolean;
  isSelectable: boolean;
}
export class UIComponent extends Component<IUIComponent> {}
