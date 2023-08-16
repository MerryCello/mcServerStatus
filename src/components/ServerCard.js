import { useState } from "react";
import parse from "html-react-parser";
import Signal from "./Signal";
import serverDefaultIcon from "../images/serverDefaultIcon.png";
import { useWindowDimensions } from "../hooks";

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
  const [isSelected, setIsSelected] = useState(false);
  const icon = status?.icon;
  const motd = status?.motd;
  const playersOnline = status?.players?.online;
  const maxPlayers = status?.players?.max;

  const { width } = useWindowDimensions();
  const isMobileOrTablet = width < 500;

  const cardOnClick = () => {
    setIsSelected(true);
    if (onClick) {
      onClick(index);
    }
  };

  const cardOnFocus = () => {
    setIsSelected(true);
    if (onFocus) {
      onFocus(index);
    }
  };

  const cardOnBlur = (event) => {
    setIsSelected(false);
    if (onBlur) {
      onBlur(event);
    }
  };

  return (
    // TODO: put inline styles in CSS file
    <div
      className={"card-grid" + (isSelected ? " card-selected" : "")}
      style={style}
      onFocus={cardOnFocus}
      onBlur={cardOnBlur}
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
                    status?.players?.list
                      ? status.players.list.join("\n")
                      : status?.players?.online
                      ? "No players disclosed"
                      : "No players online"
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
                  pingAvgMs: status?.pingAvgMs,
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
            style={status?.online ? { color: "#7e7e7e" } : { color: "red" }}
          >
            {status?.online && motd
              ? parse(
                  motd?.html
                    ?.map((strHtml, i) => `<span key={${i}}>${strHtml}</span>`)
                    .join("<br/>") || ""
                )
              : status?.loading
              ? ""
              : "Can't connect to server"}
          </p>
        </div>
      </div>
      {isMobileOrTablet && isSelected && (
        <>
          <p style={{ color: "#7e7e7e" }}>
            {parse(
              status?.version?.replace(/ /gm, "<br/>").replace(/,/gm, "") || ""
            )}
          </p>
          <p className="player-list">
            {status?.players?.list
              ? status.players.list.join(", ")
              : status?.players?.online
              ? "No players disclosed"
              : "No players online"}
          </p>
        </>
      )}
    </div>
  );
};

export default ServerCard;
