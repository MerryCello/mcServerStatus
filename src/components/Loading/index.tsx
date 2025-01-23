import React, {FC, useEffect, useState} from 'react';

export const LOADING_STATES = ['O o o', 'o O o', 'o o O', 'o O o'];

type LoadingProps = {
  servers: Array<any>;
  setServers: (
    newState:
      | LoadingProps['servers']
      | ((prevState: LoadingProps['servers']) => LoadingProps['servers']),
  ) => void;
};

export const Loading: FC<LoadingProps> = ({servers, setServers}) => {
  const [noServersLoaderIndex, setNoServersLoaderIndex] = useState(0);
  useEffect(() => {
    const interval = setLoadingInterval();
    return () => clearInterval(interval);
  }, []);

  const setLoadingInterval = () => {
    const interval = setInterval(() => {
      if (servers.length === 0) {
        // Have to use setState function to get the actual state of 'noServersLoader'
        // because 'noServersLoader' variable will not show the actual value in the
        // setInterval scope.
        setNoServersLoaderIndex(
          (prevState) => (prevState + 1) % LOADING_STATES.length,
        );
        // call set state just to get the actual state of 'servers'
        setServers((prevState) => {
          if (prevState.length !== 0) {
            clearInterval(interval);
          }
          return prevState;
        });
      }
    }, 300);
    return interval;
  };

  return (
    <div title="(Doesn't actually scan)">
      <h1 style={{marginBottom: '0px', marginTop: '25px'}}>
        {'Scanning for games on your local network'}
      </h1>
      <h1 style={{color: '#7e7e7e', textShadow: 'none'}}>
        {LOADING_STATES[noServersLoaderIndex]}
      </h1>
    </div>
  );
};
