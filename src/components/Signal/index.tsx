import React, { CSSProperties, FC, useEffect, useState } from 'react';
import bar1 from '../../images/1-5_Signal.png';
import bar2 from '../../images/2-5_Signal.png';
import bar3 from '../../images/3-5_Signal.png';
import bar4 from '../../images/4-5_Signal.png';
import fullSignal from '../../images/fullSignal.png';
import noSignal from '../../images/noSignal.png';
import searchingSignal from '../../images/searchingSignal.gif';

const VERY_POOR_SIGNAL = 8000;
const POOR_SIGNAL = 4000;
const GOOD_SIGNAL = 2000;
const VERY_GOOD_SIGNAL = 1700;
const EXCELLENT_SIGNAL = 0;
const IMAGES = { bar1, bar2, bar3, bar4, fullSignal, noSignal, searchingSignal };

type SignalProps = {
  server: {
    hostname: string;
    online?: boolean;
    loading?: boolean;
    pingAvgMs?: number;
  };
  size: number;
  style: CSSProperties;
};

const Signal: FC<SignalProps> = ({ server, size, style }) => {
  const [sigImg, setSigImg] = useState<keyof typeof IMAGES>('searchingSignal');

  useEffect(() => {
    if (server?.loading) {
      setSigImg('searchingSignal');
    } else if (server?.online && server?.pingAvgMs) {
      let pingAvgMs = server?.pingAvgMs;
      if (pingAvgMs >= EXCELLENT_SIGNAL && pingAvgMs < VERY_GOOD_SIGNAL) {
        setSigImg('fullSignal');
      } else if (pingAvgMs >= VERY_GOOD_SIGNAL && pingAvgMs < GOOD_SIGNAL) {
        setSigImg('bar4');
      } else if (pingAvgMs >= GOOD_SIGNAL && pingAvgMs < POOR_SIGNAL) {
        setSigImg('bar3');
      } else if (pingAvgMs >= POOR_SIGNAL && pingAvgMs < VERY_POOR_SIGNAL) {
        setSigImg('bar2');
      } else { // if pingAvgMs >= VERY_POOR_SIGNAL
        setSigImg('bar1');
      }
    } else {
      setSigImg('noSignal');
    }
  }, [server]);

  return (
    <div style={style}>
      <img
        src={IMAGES[sigImg]}
        style={{ height: size + 'em', width: 'auto' }}
        alt='visual of signal strength'
      />
    </div>
  );
};

export default Signal;
