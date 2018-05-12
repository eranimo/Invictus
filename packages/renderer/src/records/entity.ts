import { makeTypedFactory, TypedRecord } from 'typed-immutable-record';

export interface IEntity {
  id: string;
  name: string;
}
export interface IEntityRecord extends TypedRecord<IEntityRecord>, IEntity { }

const defaultEntity = {
  id: null,
  name: null,
};
export const EntityFactory = makeTypedFactory<IEntity, IEntityRecord>(defaultEntity);
