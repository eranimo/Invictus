import { Component } from '@invictus/engine/game';


export interface PositionData {
  x: number;
  y: number;
}

const Position: Component<PositionData> = {
  factory(): PositionData {
    return {
      x: null,
      y: null,
    };
  },
  reset(position: PositionData) {
    position.x = null;
    position.y = null;
  },
};

export default Position;
