import React, {useEffect, useRef, useState} from 'react';
import '../App.css';
import request from 'superagent';
import {Button, Loading, ServerCard} from '../components';
import {getUserServers} from '../firebase/controlers';
import {ServerData} from '../firebase/types';
import {ServerStatus} from '../types';
import {isNil} from 'lodash';

const loadingObj: ServerStatus = {loading: true};
const EDIT = 'Edit';
const DELETE = 'Delete';
const ADD_SERVER = 'Add Server';
const REFRESH = 'Refresh';

interface Server extends ServerData {
  status: ServerStatus;
}

const LandingPage = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [srvSelIndex, setSrvSelIndex] = useState<number | null>(null);
  const editRef = useRef(null);
  const deleteRef = useRef(null);
  const [editDisabled, setEditDisabled] = useState(true);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const addServerRef = useRef(null);
  const refreshRef = useRef(null);

  useEffect(() => {
    getUserServers().then((serversResponse) => {
      const serversWithLoading = serversResponse.map((server) => ({
        ...server,
        status: loadingObj,
      }));
      setServers(serversWithLoading);
      updateServersStatus(serversWithLoading);
    });
  }, []);

  const serverCardSelect = (index: any) => {
    setEditDisabled(false);
    setDeleteDisabled(false);
    setSrvSelIndex(index);
  };

  const serverCardOnBlur = (event: any) => {
    const element = event?.relatedTarget ?? event?.target;
    const elementText = element?.innerHTML;
    // TODO: find better solution than this
    if (
      !(
        elementText === EDIT ||
        elementText === DELETE ||
        element?.classList?.contains('card-grid')
      )
    ) {
      setSrvSelIndex(null);
      setEditDisabled(true);
      setDeleteDisabled(true);
    }
  };

  const updateServerStatusState = (
    serverId: string | undefined,
    srvStatus: ServerStatus,
  ) => {
    setServers((prevServers) => {
      let updatedServers = prevServers;
      let i = updatedServers.findIndex((srv) => srv.id === serverId);
      updatedServers[i] = {
        ...updatedServers[i],
        status: srvStatus,
      };

      // deconstruct to copy array so it rerenders
      return [...updatedServers];
    });
  };

  const fetchMcsrvstat = (srv: Server) => {
    const startTime = Date.now();
    const nowInSeconds = Math.floor(startTime / 1000);
    const cacheExpiry = srv?.status?.debug?.cacheexpire;
    if (!cacheExpiry || cacheExpiry <= nowInSeconds) {
      request
        .get('https://api.mcsrvstat.us/2/' + srv.address)
        .then((res) => {
          // pingAvgMs - not actual ping
          const pingAvgMs = Date.now() - startTime;
          updateServerStatusState(srv.id, {...res?.body, pingAvgMs});
        })
        .catch((e: Error) => {
          updateServerStatusState(srv.id, {
            error: e,
            online: false,
            loading: false,
          });
          console.log(e);
        });
    } else {
      setTimeout(
        () => updateServerStatusState(srv.id, {...srv?.status, loading: false}),
        500,
      );
    }
  };

  const updateServersStatus = (srvs: Server[]) => {
    for (const server of srvs) {
      fetchMcsrvstat({...server});
    }
  };

  const renderServerCards = () =>
    servers.map(({name, address, status}, i) => (
      <ServerCard
        onFocus={serverCardSelect}
        onBlur={serverCardOnBlur}
        key={i}
        tabIndex={i + 1}
        index={i}
        style={{marginBottom: '8px'}}
        name={name}
        address={address}
        status={status}
      />
    ));

  const renderServersList = () => {
    if (servers.length === 0) {
      return <Loading servers={servers} setServers={setServers} />;
    }
    return renderServerCards();
  };

  const refreshServers = () => {
    const serverRst = servers.map((server) => {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const cacheExpiry = server?.status?.debug?.cacheexpire;
      return {
        ...server,
        status:
          !cacheExpiry || cacheExpiry <= nowInSeconds
            ? {...loadingObj, icon: server.status?.icon}
            : {...server.status, ...loadingObj},
      };
    });
    setServers(serverRst);
    updateServersStatus(serverRst);
  };

  return (
    <div className='main-container landing-container'>
      <h1>Server Status</h1>
      <div className='servers-list-bg'>
        <div className='servers-list'>{renderServersList()}</div>
      </div>
      <div className='options'>
        <Button
          ref={editRef}
          disabled={editDisabled}
          linkTo='/mcServerStatus/edit'
          state={
            !isNil(srvSelIndex)
              ? {
                  id: servers[srvSelIndex]?.id,
                  name: servers[srvSelIndex]?.name,
                  address: servers[srvSelIndex]?.address,
                }
              : {}
          }>
          {EDIT}
        </Button>
        <Button
          ref={deleteRef}
          disabled={deleteDisabled}
          linkTo='/mcServerStatus/delete'
          state={
            !isNil(srvSelIndex)
              ? {
                  id: servers[srvSelIndex]?.id,
                  name: servers[srvSelIndex]?.name,
                }
              : {}
          }>
          {DELETE}
        </Button>
        <Button
          tabIndex={1000}
          ref={addServerRef}
          linkTo={'/mcServerStatus/add'}>
          {ADD_SERVER}
        </Button>
        <Button tabIndex={1001} ref={refreshRef} onClick={refreshServers}>
          {REFRESH}
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
