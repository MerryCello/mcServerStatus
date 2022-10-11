import { useEffect, useState } from "react";
import bar1 from "../images/1-5_Signal.png";
import bar2 from "../images/2-5_Signal.png";
import bar3 from "../images/3-5_Signal.png";
import bar4 from "../images/4-5_Signal.png";
import fullSignal from "../images/fullSignal.png";
import noSignal from "../images/noSignal.png";
import searchingSignal from "../images/searchingSignal.gif";


const Signal = ({ server, size, style }) => {
  const [sigImg, setSigImg] = useState(searchingSignal)

  useEffect(() => {
    if (server?.online)
      setSigImg(fullSignal)
    else if (server?.loading)
       setSigImg(searchingSignal)
    else
       setSigImg(noSignal)
  }, [server])

  return (
    <div style={style}>
      <img src={sigImg} style={{ height: size + "em", width: "auto" }} alt="visual of signal strength"/>
    </div>
  );
}

export default Signal;