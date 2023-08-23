import { FC } from "react";
import { useRouteError } from "react-router-dom";

const NotFound404: FC = () => {
  const error = useRouteError();
  console.log(error);
  return (
    <div className="main-container delete-page-container column">
      <p>404: Not Found</p>
      <p className="m-0">~~~~~~~~~~~~~~~~~~~</p>
      <p>The page you were looking for is in another realm</p>
    </div>
  );
};

export default NotFound404;
