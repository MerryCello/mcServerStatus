import React, {useEffect, useRef, useState} from 'react';
import '../App.css';
import request from 'superagent';
import {Button, Loading, ServerCard} from '../components';
import {getUserServers} from '../firebase/controlers';
import {ServerData} from '../firebase/types';
import {ServerStatus} from '../types';
import {isNil} from 'lodash';
import {arrayMove, List} from 'react-movable';
import {useWindowDimensions} from '../hooks';
import {ServerCardProps} from '../components/ServerCard/types';
import {useLongPress} from 'use-long-press';

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
  const [enableServersDnd, setEnableServersDnd] = useState(false);
  const addServerRef = useRef(null);
  const refreshRef = useRef(null);
  const {width} = useWindowDimensions();
  const isMobileOrTablet = width < 500;
  const disableList = !isMobileOrTablet || !enableServersDnd;
  const getLongPressProps = useLongPress(() => setEnableServersDnd(true), {
    threshold: 500,
  });

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

  const serverCardSelect = (index: number) => {
    setEditDisabled(false);
    setDeleteDisabled(false);
    setSrvSelIndex(index);
  };
  const beforeCardDrag: List<Server>['props']['beforeDrag'] = ({index}) => {
    if (!disableList && !isNil(index) && index >= 0) {
      serverCardSelect(index);
    }
  };
  const afterCardDrag: List<Server>['props']['afterDrag'] = ({newIndex}) => {
    if (!disableList && !isNil(newIndex) && newIndex >= 0) {
      serverCardSelect(newIndex);
    }
  };

  const serverCardOnBlur: ServerCardProps['onBlur'] = (event) => {
    const element = event?.relatedTarget ?? event?.target;
    const elementText = element?.innerHTML;
    // TODO: find better solution than this
    if (!(elementText === EDIT || elementText === DELETE)) {
      setSrvSelIndex(null);
      setEditDisabled(true);
      setDeleteDisabled(true);
      setEnableServersDnd(false);
    }
  };
  const disableServersDnd = () => setEnableServersDnd(false);

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

  const renderServersList: List<Server>['props']['renderList'] = ({
    children,
    props,
  }) => (
    <div {...props} className='servers-list'>
      {servers.length === 0 ? (
        <Loading servers={servers} setServers={setServers} />
      ) : (
        children
      )}
    </div>
  );

  const onServerListChange: List<Server>['props']['onChange'] = ({
    oldIndex,
    newIndex,
  }) => {
    setServers((prevServers) => arrayMove(prevServers, oldIndex, newIndex));
    // TODO: update server order in firebase
    setEnableServersDnd(false);
  };
  const moveServerUp = (oldIndex: number) => {
    // @ts-ignore - don't need targetRect property
    onServerListChange({
      oldIndex,
      newIndex: oldIndex - 1 < 0 ? 0 : oldIndex - 1,
    });
  };
  const moveServerDown = (oldIndex: number) => {
    // @ts-ignore - don't need targetRect property
    onServerListChange({
      oldIndex,
      newIndex:
        oldIndex + 1 >= servers.length ? servers.length - 1 : oldIndex + 1,
    });
  };

  const renderServerCard: List<Server>['props']['renderItem'] = ({
    value,
    props,
    index = servers.findIndex((srv) => srv.id === value.id),
  }) => {
    const {name, address, status} = value;
    const isNotFirstCard = index !== 0;
    const isNotLastCard = index !== servers.length - 1;
    return (
      <div
        key={index}
        id={`server-card-${index}`}
        {...props}
        {...getLongPressProps()}>
        <ServerCard
          onFocus={serverCardSelect}
          onBlur={serverCardOnBlur}
          tabIndex={index + 1}
          index={index}
          style={{marginBottom: '8px'}}
          name={name}
          address={address}
          status={status}
          showUpArrow={isNotFirstCard}
          showDownArrow={isNotLastCard}
          onUpClick={moveServerUp}
          onDownClick={moveServerDown}
          isSelected={index === srvSelIndex}
          isDraggable={enableServersDnd}
        />
      </div>
    );
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
    <div
      className='main-container landing-container'
      onClick={disableServersDnd}>
      <h1>Server Status</h1>
      <div className='servers-list-bg'>
        <List
          disabled={disableList}
          values={servers}
          onChange={onServerListChange}
          renderList={renderServersList}
          renderItem={renderServerCard}
          beforeDrag={beforeCardDrag}
          afterDrag={afterCardDrag}
          lockVertically
        />
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
