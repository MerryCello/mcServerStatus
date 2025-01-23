import React, {
  CSSProperties,
  ForwardRefRenderFunction,
  ReactNode,
  forwardRef,
} from 'react';
import {To} from 'react-router-dom';
import buttonPlate from '../../images/Button_Plate.mp3';
import {isNil} from '../../utils';
import {useButtonNavigate} from '../../hooks';

type ButtonProps = {
  linkTo?: To;
  state?: any;
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  disabled?: boolean;
  tabIndex?: number;
};

const buttonPlateAudio = new Audio(buttonPlate);

const ButtonFC: ForwardRefRenderFunction<any, ButtonProps> = (
  {linkTo, state, children, onClick, style, disabled, tabIndex},
  ref,
) => {
  const navigate = useButtonNavigate();

  const onClickCb = () => {
    buttonPlateAudio.play();
    onClick?.();
    if (!isNil(linkTo)) {
      navigate(linkTo!, {state});
    }
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      className='button'
      onClick={onClickCb}
      tabIndex={tabIndex}
      style={style}>
      {children}
    </button>
  );
};

const Button = forwardRef<any, ButtonProps>(ButtonFC);

export default Button;
export {Button};
