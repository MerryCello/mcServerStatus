import {arrayMove} from 'react-movable';

export const isNil = (obj: any): obj is null | undefined =>
  obj === null || obj === undefined;

export const noop = () => {};

export const indexIsOutOfBounds = (array: Array<any>, index: number): boolean =>
  index < 0 || index >= array.length;

export const moveItemInArray = arrayMove;
