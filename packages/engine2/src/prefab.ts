export interface IPrefab {
  name: string;
  attributes: {
    [attributeName: string]: any,
  },
  behaviors: string[],
};
