import { Component } from '@invictus/engine/game';


export interface SizeData {
  width: number;
  height: number;
}

const Size: Component<SizeData> = {
  factory(): SizeData {
    return {
      width: null,
      height: null,
    };
  },
  reset(position: SizeData) {
    position.width = null;
    position.height = null;
  },
};

export default Size;
