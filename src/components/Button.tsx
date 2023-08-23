import { CSSProperties, ReactNode, forwardRef } from "react";
import { Link, RelativeRoutingType, To } from "react-router-dom";
import buttonPlate from "../images/Button_Plate.mp3";
import { isNil } from "../utils";

type ButtonProps = {
  linkTo?: To;
  state?: any;
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  disabled?: boolean;
  tabIndex?: number;
  reloadDocument?: boolean;
  replace?: boolean;
  preventScrollReset?: boolean;
  relative?: RelativeRoutingType;
};

const buttonPlateAudio = new Audio(buttonPlate);

const Button = forwardRef<any, ButtonProps>(
  (
    {
      linkTo,
      state,
      children,
      onClick,
      style,
      disabled,
      tabIndex,
      reloadDocument,
      replace,
      preventScrollReset,
      relative,
    },
    ref
  ) => {
    const onClickCb = () => {
      buttonPlateAudio.play();
      onClick?.();
    };

    if (!isNil(linkTo)) {
      return (
        <Link
          ref={ref}
          className={"button" + (disabled ? " button-disabled" : "")}
          tabIndex={tabIndex}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            ...style,
          }}
          to={disabled ? "#" : linkTo!}
          state={state}
          reloadDocument={reloadDocument}
          replace={replace}
          preventScrollReset={preventScrollReset}
          relative={relative}
        >
          {children}
        </Link>
      );
    } else {
      return (
        <button
          ref={ref}
          disabled={disabled}
          className="button"
          onClick={onClickCb}
          tabIndex={tabIndex}
          style={style}
        >
          {children}
        </button>
      );
    }
  }
);

export default Button;
