import { useEffect, useState } from "react";
import parse from "html-react-parser";
import Signal from "./Signal";
import serverDefaultIcon from "../images/serverDefaultIcon.png";

const ServerCard = ({
  name,
  address,
  status,
  style,
  onFocus,
  onBlur,
  onClick,
  tabIndex,
  index,
}) => {
  const [selected, setSelected] = useState(false);
  const [icon, setIcon] = useState(status?.icon);
  const [motd, setMotd] = useState(status?.motd);
  const [playersOnline, setPlayersOnline] = useState(status?.playersOnline);
  const [maxPlayers, setMaxPlayers] = useState(status?.maxPlayers);

  useEffect(() => {
    setIcon(status?.icon);
    setMotd(status?.motd);
    setPlayersOnline(status?.players?.online);
    setMaxPlayers(status?.players?.max);
  }, [status]);

  const cardOnClick = () => {
    setSelected(true);
    onClick(index);
  };

  const cardOnFocus = () => {
    setSelected(true);
    onFocus(index);
  };

  const cardOnBlur = (event) => {
    setSelected(false);
    onBlur(event);
  };

  let i = 0;
  return (
    // TODO: put inline styles in CSS file
    <div
      className={"card-grid" + (selected ? " card-selected" : "")}
      style={style}
      onFocus={cardOnFocus}
      onBlur={cardOnBlur}
      // onFocus={cardOnClick}
      onClick={cardOnClick}
      tabIndex={tabIndex}
    >
      <div className="card-icon">
        <img src={icon ? icon : serverDefaultIcon} alt="icon for server" />
      </div>
      <div className="server-details">
        <div className="text-left">
          <div className="card-srv-name-status">
            <span title={address}>{name}</span>
            <span className="card-srv-name-status">
              {status?.online && (
                <span
                  className="pr-2 players-online"
                  style={{ color: "#7e7e7e" }}
                  title={
                    status?.players?.list && status.players.list.join("\n")
                  }
                >
                  {status?.players
                    ? (playersOnline ?? "") + "/" + (maxPlayers ?? "")
                    : "-/-"}
                </span>
              )}
              <Signal
                server={{
                  hostname: address,
                  online: status?.online,
                  loading: status?.loading,
                }}
                size={1}
                style={{ paddingBottom: 5 }}
              />
            </span>
          </div>
        </div>
        <div className="text-left">
          <p
            className="m-0"
            style={
              status?.online && !status?.loading
                ? { color: "#7e7e7e" }
                : { color: "red" }
            }
          >
            {status?.online && motd
              ? parse(
                  motd?.html
                    ?.map((strHtml) => `<span key={${i++}}>${strHtml}</span>`)
                    .join("<br/>")
                )
              : status?.loading
              ? ""
              : "Can't connect to server"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerCard;
