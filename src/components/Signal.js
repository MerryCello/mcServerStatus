import { useEffect, useState } from "react";
import bar1 from "../images/1-5_Signal.png";
import bar2 from "../images/2-5_Signal.png";
import bar3 from "../images/3-5_Signal.png";
import bar4 from "../images/4-5_Signal.png";
import fullSignal from "../images/fullSignal.png";
import noSignal from "../images/noSignal.png";
import searchingSignal from "../images/searchingSignal.gif";

const VERY_POOR_SIGNAL = 8000;
const POOR_SIGNAL = 4000;
const GOOD_SIGNAL = 2000;
const VERY_GOOD_SIGNAL = 1700;
const EXCELLENT_SIGNAL = 0;

const Signal = ({ server, size, style }) => {
  const [sigImg, setSigImg] = useState(searchingSignal);

  useEffect(() => {
    if (server?.online) {
      let pingAvgMs = server?.pingAvgMs;
      if (pingAvgMs >= EXCELLENT_SIGNAL && pingAvgMs < VERY_GOOD_SIGNAL) {
        setSigImg(fullSignal);
      } else if (pingAvgMs >= VERY_GOOD_SIGNAL && pingAvgMs < GOOD_SIGNAL) {
        setSigImg(bar4);
      } else if (pingAvgMs >= GOOD_SIGNAL && pingAvgMs < POOR_SIGNAL) {
        setSigImg(bar3);
      } else if (pingAvgMs >= POOR_SIGNAL && pingAvgMs < VERY_POOR_SIGNAL) {
        setSigImg(bar2);
      } else if (pingAvgMs >= VERY_POOR_SIGNAL) {
        setSigImg(bar1);
      }
    } else if (server?.loading) {
      setSigImg(searchingSignal);
    } else {
      setSigImg(noSignal);
    }
  }, [server]);

  return (
    <div style={style}>
      <img
        src={sigImg}
        style={{ height: size + "em", width: "auto" }}
        alt="visual of signal strength"
      />
    </div>
  );
};

export default Signal;
