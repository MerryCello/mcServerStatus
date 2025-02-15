import arrowDown from '../../images/arrow-down.png';
import arrowUp from '../../images/arrow-up.png';
import arrowRight from '../../images/arrow-right.png';
import arrowDownSelected from '../../images/arrow-down-selected.png';
import arrowUpSelected from '../../images/arrow-up-selected.png';
import arrowRightSelected from '../../images/arrow-right-selected.png';

export const ARROWS = {
  'up-button': arrowUp,
  'down-button': arrowDown,
  'play-button': arrowRight,
};
export const ARROWS_SELECTED = {
  'up-button': arrowUpSelected,
  'down-button': arrowDownSelected,
  'play-button': arrowRightSelected,
};

export const getAttribute = (
  e: any,
  attr: string,
): keyof typeof ARROWS_SELECTED =>
  e.currentTarget.attributes.getNamedItem(attr)?.value;
