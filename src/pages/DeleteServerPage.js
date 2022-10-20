import React from "react";
import { useLocation } from "react-router-dom";
import Button from "../components/Button";

const DeleteServerPage = () => {
  const { state } = useLocation();

  const deleteOnClick = () => {
    // TODO: delete stuff
    alert(
      " ⚠⚠⚠⚠⚠⚠⚠⚠\n👷‍♂️ Hard hat required 🛠\n👷‍♂️ Construction zone 🛠\n ⚠⚠⚠⚠⚠⚠⚠⚠"
    );
    setTimeout(() => (window.location.href = "/"), 100); // 100ms for Button sound fx to play
  };

  return (
    <div className="main-container delete-page-container column">
      <p>Are you sure you want to remove this server?</p>
      <p>{`\`${state?.name ?? ""}' will be lost forever! (A long time!)`}</p>
      <div className="buttons row">
        <Button
          onClick={deleteOnClick}
          style={{ flex: 1, marginRight: "35px" }}
        >
          Delete
        </Button>
        <Button linkTo="/" style={{ flex: 1 }}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DeleteServerPage;
