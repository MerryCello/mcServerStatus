import React from "react";
import buttonPlate from "../images/Button_Plate.mp3";

const Button = React.forwardRef(
  ({ children, onClick, style, disabled }, ref) => {
    const buttonPlateAudio = new Audio(buttonPlate);

    const onClickCb = () => {
      buttonPlateAudio.play();
      onClick();
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className="button"
        onClick={onClickCb}
        style={style}
      >
        {children}
      </button>
    );
  }
);

export default Button;
