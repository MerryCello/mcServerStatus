import React, {CSSProperties, FC} from 'react';
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
const IMAGES = {bar1, bar2, bar3, bar4, fullSignal, noSignal, searchingSignal};

export const getSignalImage = (server: SignalProps['server']) => {
  if (server?.loading) {
    return 'searchingSignal' as const;
  }

  if (server?.online && server?.pingAvgMs) {
    const pingAvgMs = server.pingAvgMs;

    if (pingAvgMs >= EXCELLENT_SIGNAL && pingAvgMs < VERY_GOOD_SIGNAL) {
      return 'fullSignal' as const;
    }

    if (pingAvgMs >= VERY_GOOD_SIGNAL && pingAvgMs < GOOD_SIGNAL) {
      return 'bar4' as const;
    }

    if (pingAvgMs >= GOOD_SIGNAL && pingAvgMs < POOR_SIGNAL) {
      return 'bar3' as const;
    }

    if (pingAvgMs >= POOR_SIGNAL && pingAvgMs < VERY_POOR_SIGNAL) {
      return 'bar2' as const;
    }

    return 'bar1' as const;
  }

  return 'noSignal' as const;
};

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

const Signal: FC<SignalProps> = ({server, size, style}) => {
  const sigImg = getSignalImage(server);

  return (
    <div style={style}>
      <img
        src={IMAGES[sigImg]}
        style={{height: size + 'em', width: 'auto'}}
        alt='visual of signal strength'
      />
    </div>
  );
};

export default Signal;
export {Signal};
