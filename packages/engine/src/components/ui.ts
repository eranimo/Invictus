import Component from '@invictus/engine/core/component';


export interface IUIComponent {
  name: string;
  isVisible: boolean;
  isSelectable: boolean;
  isSelected: boolean;
}
export class UIComponent extends Component<IUIComponent> {}
