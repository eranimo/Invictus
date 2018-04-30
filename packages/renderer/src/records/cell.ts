import { makeTypedFactory, TypedRecord } from 'typed-immutable-record';


export interface ICell {
  x: number;
  y: number;
}
export interface ICellRecord extends TypedRecord<ICellRecord>, ICell { }

const defaultCell = { x: null, y: null };
export const CellFactory = makeTypedFactory<ICell, ICellRecord>(defaultCell);
