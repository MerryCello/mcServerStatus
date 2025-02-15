import {arrayMove} from 'react-movable';

export const indexIsOutOfBounds = (array: Array<any>, index: number): boolean =>
  index < 0 || index >= array.length;

export const moveItemInArray = arrayMove;
