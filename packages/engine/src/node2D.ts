import Node from './node';
import Vector2D from 'victor';


export interface Node2DProps {
  position?: Vector2D;
}
export default class Node2D<T extends Node2DProps> extends Node<T> {
  static defaultProps = {
    position: new Vector2D(0, 0)
  };

  onReady() {
    console.log(this.props);
  }
}
