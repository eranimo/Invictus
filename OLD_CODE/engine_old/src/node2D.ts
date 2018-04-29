import Vector2D from 'victor';

export interface Node2DProps {
  position?: { x: number, y: number };
}
export default class Node2D<T extends Node2DProps> extends Node<T> {
  position: Vector2D;

  static defaultProps = {
    position: { x: 0, y: 0 },
  };

  onReady() {
    this.position = new Vector2D(this.props.position.x, this.props.position.y);
  }

  onPositionUpdate() {}

  setPosition(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this.onPositionUpdate();
  }

  changePosition(vector: Vector2D) {
    this.position.add(vector);
    this.onPositionUpdate();
  }
}

import Node from './node';
