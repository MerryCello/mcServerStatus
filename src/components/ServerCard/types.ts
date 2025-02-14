import {CSSProperties, DOMAttributes, FocusEventHandler} from 'react';
import {ServerStatus} from '../../types';

export type ServerCardProps = {
  name: string;
  address: string;
  status: ServerStatus;
  style?: CSSProperties;
  onFocus: (index: number) => void;
  onBlur: FocusEventHandler<HTMLDivElement>;
  onClick?: (index: number) => void;
  showUpArrow?: boolean;
  showDownArrow?: boolean;
  onUpClick?: (index: number) => void;
  onDownClick?: (index: number) => void;
  tabIndex: number;
  index: number;
  isSelected?: boolean;
  isDraggable?: boolean;
};

export type OnMouseEnter = DOMAttributes<HTMLImageElement>['onMouseEnter'];
export type OnMouseLeave = DOMAttributes<HTMLImageElement>['onMouseLeave'];
