import { useEffect, useState } from "react";
import parse from "html-react-parser";
import Signal from "./Signal";
import serverDefaultIcon from "../images/serverDefaultIcon.png"

const ServerCard = ({server, status, style, onClick, tabIndex}) => {
   const [icon, setIcon] = useState(status?.icon)
   const [serverSt, setServer] = useState(status?.address)
   const [motd, setMotd] = useState(status?.motd)
   const [playersOnline, setPlayersOnline] = useState(status?.playersOnline)
   const [maxPlayers, setMaxPlayers] = useState(status?.maxPlayers)

   useEffect(() => {
      setIcon(status?.icon)
      setServer(server)
      setMotd(status?.motd)
      setPlayersOnline(status?.players?.online)
      setMaxPlayers(status?.players?.max)
   }, [status])

   let i = 0;
   return (
      // TODO: put inline styles in .css file
      <div className="card-grid" style={style} onClick={onClick} tabIndex={tabIndex}>
         <div className="card-icon">
            <img src={icon ? icon : serverDefaultIcon} className="" style={{height: "6rem", width: "auto", paddingRight: "8px"}} alt="icon for server"/>
         </div>
         <div className="server-details">
            <div className="text-left">
               <div className="card-srv-name-status">
                  <span>{serverSt}</span>
                  <span className="card-srv-name-status">
                     {status.online &&
                     <span className="pr-2" style={{color: "#7e7e7e"}} title={status?.players?.list && status.players.list.join("\n")}>{status?.players ? (playersOnline + "/" + maxPlayers) : "-/-"}</span>
                     }
                     <Signal serverStatus={status} size={1} style={{paddingBottom: 5}} />
                  </span>
               </div>
            </div>
            <div className="text-left">
               <p className="m-0" style={status.online && !status.loading ? {color: "#7e7e7e"} : {color: "red"}}>{
                  status.online && motd
                     ? parse(motd?.html?.map((strHtml) => `<span key={${i++}}>${strHtml}</span>`).join("<br/>"))
                     : status.loading 
                        ? ""
                        : "Can't connect to server"
               }</p>
            </div>
         </div>
      </div>
   );
}

export default ServerCard;