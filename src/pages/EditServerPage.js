import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "../components/Button";
import { isNil } from "../utils";

const NAME_PLACEHOLDER = "Minecraft Server";

const EditServerPage = () => {
  const { state } = useLocation();
  const [nameState, setNameState] = useState(state?.name ?? NAME_PLACEHOLDER);
  const [addressState, setAddressState] = useState(state?.address ?? "");
  const doneRef = useRef(null);

  useEffect(() => {
    doneRef.current.disabled = addressState === "";
  }, []);

  const nameInputOnChange = ({ target: input }) => {
    setNameState(input.value);
  };
  const addressInputOnChange = ({ target: input }) => {
    setAddressState(input.value);
    if (input.value !== "") {
      doneRef.current.disabled = false;
    } else {
      doneRef.current.disabled = true;
    }
  };

  const nameInputOnBlur = () => {
    if (nameState === "") setNameState(NAME_PLACEHOLDER);
  };

  const doneOnClick = () => {
    // no state means that a new server status entry is to be added
    if (isNil(state)) {
      // TODO: create server status entry
    } else {
      // TODO: save server status entry
    }
    alert(
      " ⚠⚠⚠⚠⚠⚠⚠⚠\n👷‍♂️ Hard hat required 🛠\n👷‍♂️ Construction zone 🛠\n ⚠⚠⚠⚠⚠⚠⚠⚠"
    );
    setTimeout(() => (window.location.href = "/"), 100); // 100ms for Button sound fx to play
  };

  return (
    <div className="main-container edit-page-container">
      <h1>Edit Server Info</h1>
      <div className="edit-form-container column">
        <div className="inputs column">
          <label>Server Name</label>
          <input
            type={"text"}
            tabIndex={1}
            autoFocus
            onChange={nameInputOnChange}
            onBlur={nameInputOnBlur}
            value={nameState}
          />
          <label>Server Address</label>
          <input
            type={"text"}
            tabIndex={2}
            value={addressState}
            onChange={addressInputOnChange}
          />
        </div>
        <div className="buttons column">
          <Button onClick={doneOnClick} tabIndex={3} ref={doneRef}>
            Done
          </Button>
          <Button linkTo={"/"} tabIndex={4}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditServerPage;
