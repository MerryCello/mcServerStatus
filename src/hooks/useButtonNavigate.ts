import {useNavigate} from 'react-router-dom';

export const useButtonNavigate: typeof useNavigate = () => {
  const navigate = useNavigate();
  return (...params) => {
    setTimeout(() => navigate(...(params as Parameters<typeof navigate>)), 100); // 100ms for Button sound fx to play
  };
};
