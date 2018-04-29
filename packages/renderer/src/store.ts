import { createStore, combineReducers, Store } from 'redux';
import { Point } from 'pixi.js';
import * as Immutable from 'immutable';
import { makeTypedFactory, TypedRecord } from 'typed-immutable-record';


import EventEmitter from "@invictus/engine/utils/eventEmitter";
import { UIEvents } from "@invictus/engine/core/game";


interface ICell  {
  x: number;
  y: number;
}
interface ICellRecord extends TypedRecord<ICellRecord>, ICell { }

const defaultCell = { x: null, y: null };
const CellFactory = makeTypedFactory<ICell, ICellRecord>(defaultCell);


export type UIState = {
  hoveredCell: Point | null,
  selectedCells: Immutable.Set<ICellRecord>,
};

const defaultState = {
  hoveredCell: null,
  selectedCells: Immutable.Set([]),
}

function rootReducer(state: UIState = defaultState, action): UIState {
  switch (action.type) {
    case UIEvents.CELL_HOVERED:
      return { ...state, hoveredCell: action.payload }
    case UIEvents.CELL_SELECTED:
      return {
        ...state,
        selectedCells: state.selectedCells.add(CellFactory(action.payload.coord)),
      };
    case UIEvents.CELL_UNSELECTED:
      return {
        ...state,
        selectedCells: state.selectedCells.remove(CellFactory(action.payload)),
      };
    default:
      return state;
  }
}

function configureStore(initialState: UIState = defaultState): Store<UIState> {
  return createStore(rootReducer, initialState);
}

const store: Store<UIState> = configureStore();

export function connectStore(events: EventEmitter<UIEvents>) {
  events.on(UIEvents.CELL_HOVERED, (coord: Point) => {
    store.dispatch({ type: UIEvents.CELL_HOVERED, payload: coord });
  });
  events.on(UIEvents.CELL_SELECTED, (data) => {
    store.dispatch({ type: UIEvents.CELL_SELECTED, payload: data });
  });
  events.on(UIEvents.CELL_UNSELECTED, (coord: Point) => {
    store.dispatch({ type: UIEvents.CELL_UNSELECTED, payload: coord });
  });
}

export default store;
