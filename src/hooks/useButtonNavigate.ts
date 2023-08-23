import { NavigateOptions, To, useNavigate } from "react-router-dom";

export const useButtonNavigate = () => {
  const navigate = useNavigate();
  return (linkTo: To, options?: NavigateOptions) => {
    setTimeout(() => navigate(linkTo!, options), 100); // 100ms for Button sound fx to play
  };
};
