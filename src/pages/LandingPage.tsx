import React, {useEffect, useRef, useState} from 'react';
import {isEmpty, isNil} from 'lodash';
import {List} from 'react-movable';
import request from 'superagent';
import {useLongPress} from 'use-long-press';
import '../App.css';
import {Button, Loading, ServerCard} from '../components';
import {
  createSharedList,
  getUserServers,
  getUserSharedListsIds,
  hasReachedSharedListLimit,
  moveUserServer,
} from '../firebase/controlers';
import {ServerData} from '../firebase/types';
import {ServerStatus} from '../types';
import {useWindowDimensions} from '../hooks';
import {ServerCardProps} from '../components/ServerCard/types';
import {moveItemInArray} from '../utils';
import {useParams, useNavigate} from 'react-router-dom';
import {EditRouteLocation} from './EditServerPage';
import {DeleteRouteLocation} from './DeleteServerPage';

const loadingObj: ServerStatus = {loading: true};
const EDIT = 'Edit';
const DELETE = 'Delete';
const ADD_SERVER = 'Add Server';
const REFRESH = 'Refresh';
const SHARE = 'Share List';

interface Server extends ServerData {
  status: ServerStatus;
}

const LandingPage = () => {
  const navigate = useNavigate();
  const {sharedListId} = useParams<{sharedListId: string}>();
  const [servers, setServers] = useState<Server[]>([]);
  const [srvSelIndex, setSrvSelIndex] = useState<number | null>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLDivElement>(null);
  const [editDisabled, setEditDisabled] = useState(true);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const [enableServersDnd, setEnableServersDnd] = useState(false);
  const [usersSharedListsIds, setUsersSharedListsIds] = useState<
    string[] | null
  >(null);
  const addServerRef = useRef(null);
  const refreshRef = useRef(null);
  const {width} = useWindowDimensions();
  const isMobileOrTablet = width < 500; // TODO: use better solution: https://stackoverflow.com/a/77654885/11264753
  const disableList = !isMobileOrTablet || !enableServersDnd;
  const getLongPressProps = useLongPress(() => setEnableServersDnd(true), {
    threshold: 500,
  });
  const userOwnsSharedList = !!usersSharedListsIds?.includes(
    sharedListId ?? '',
  );
  const userOwnsList = isNil(sharedListId) || userOwnsSharedList;

  useEffect(
    function getServers() {
      getUserServers(sharedListId)
        .then((serversResponse) => {
          const serversWithLoading = serversResponse.map((server) => ({
            ...server,
            status: loadingObj,
          }));
          setServers(serversWithLoading);
          updateServersStatus(serversWithLoading);
        })
        .catch((error) => {
          if (error === 'SHARE_ID_NOT_FOUND') {
            navigate('/mcServerStatus', {replace: true});
          } else {
            console.error('failed getting servers list', error);
          }
        });

      getUserSharedListsIds().then(setUsersSharedListsIds);
    },
    [sharedListId],
  );

  const serverCardSelect = (index: number) => {
    if (userOwnsList) {
      setEditDisabled(false);
      setDeleteDisabled(false);
    }
    setSrvSelIndex(index);
  };
  const onCardDrag = (params: {index?: number; newIndex?: number}) => {
    const index = params.index ?? params.newIndex;
    if (!disableList && !isNil(index) && index >= 0) {
      serverCardSelect(index);
    }
  };

  const disableServersDnd = () => setEnableServersDnd(false);
  const serverCardOnBlur: ServerCardProps['onBlur'] = (event) => {
    const element = event?.relatedTarget ?? event?.target; // needed for iOS
    const elementText = element?.innerHTML;
    // TODO: find better solution than this
    if (
      !(
        elementText === EDIT ||
        elementText === DELETE ||
        // needed for iOS
        element?.classList?.contains('card-grid')
      )
    ) {
      setSrvSelIndex(null);
      setEditDisabled(true);
      setDeleteDisabled(true);
      disableServersDnd();
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
    setServers((prevServers) =>
      moveItemInArray(prevServers, oldIndex, newIndex),
    );
    moveUserServer(oldIndex, newIndex, sharedListId).catch(console.error);
    disableServersDnd();
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
          showUpArrow={isNotFirstCard && userOwnsList}
          showDownArrow={isNotLastCard && userOwnsList}
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

  const createNewSharedList = async () => {
    let newSharedListId = '';
    try {
      newSharedListId = await createSharedList();
    } catch (error) {
      if (error === 'MAX_SHARED_LISTS_REACHED') {
        alert('You have reached the maximum number of shared lists');
        return;
      }
      alert('Failed to create shared list');
      console.error('failed creating shared list', error);
      return;
    }
    navigate(`/mcServerStatus/list/${newSharedListId}`, {replace: true});
  };

  let shareButton = null;
  /******* SHARE *******/
  if (isNil(sharedListId) && !hasReachedSharedListLimit(usersSharedListsIds)) {
    shareButton = (
      <Button tabIndex={1002} ref={refreshRef} onClick={createNewSharedList}>
        {SHARE}
      </Button>
    );
    /******* VIEW SHARED LIST *******/
  } else if (isNil(sharedListId) && usersSharedListsIds?.[0]) {
    shareButton = (
      <Button
        tabIndex={1003}
        onClick={() =>
          navigate(`/mcServerStatus/list/${usersSharedListsIds[0]}`, {
            replace: true,
          })
        }>
        {'View Shared List'}
      </Button>
    );
    /******* VIEW PRIVATE LIST *******/
  } else if (sharedListId) {
    shareButton = (
      <Button
        tabIndex={1004}
        onClick={() => navigate('/mcServerStatus', {replace: true})}>
        {`View ${userOwnsSharedList ? 'Private' : 'My'} List`}
      </Button>
    );
  }

  return (
    <div
      className='main-container landing-container'
      onClick={disableServersDnd}>
      <h1>{`${sharedListId ? 'Shared ' : ''}Server Status`}</h1>
      <div className='servers-list-bg'>
        <List
          disabled={disableList || !userOwnsSharedList}
          values={servers}
          onChange={onServerListChange}
          renderList={renderServersList}
          renderItem={renderServerCard}
          beforeDrag={onCardDrag}
          afterDrag={onCardDrag}
          lockVertically
        />
      </div>
      <div className='options'>
        {/******* EDIT *******/}
        <Button
          ref={editRef}
          disabled={editDisabled}
          linkTo='/mcServerStatus/edit'
          state={
            (!isNil(srvSelIndex)
              ? {
                  listId: sharedListId,
                  id: servers[srvSelIndex]?.id,
                  name: servers[srvSelIndex]?.name,
                  address: servers[srvSelIndex]?.address,
                }
              : {}) satisfies EditRouteLocation['state']
          }>
          {EDIT}
        </Button>

        {/******* DELETE *******/}
        <Button
          ref={deleteRef}
          disabled={deleteDisabled}
          linkTo='/mcServerStatus/delete'
          state={
            (!isNil(srvSelIndex)
              ? {
                  id: servers[srvSelIndex]?.id,
                  name: servers[srvSelIndex]?.name,
                  listId: sharedListId,
                }
              : {}) satisfies DeleteRouteLocation['state']
          }>
          {DELETE}
        </Button>

        {/******* ADD *******/}
        <Button
          tabIndex={1000}
          ref={addServerRef}
          disabled={!userOwnsList}
          linkTo={'/mcServerStatus/add'}
          state={{listId: sharedListId} satisfies EditRouteLocation['state']}>
          {ADD_SERVER}
        </Button>

        {/******* REFRESH *******/}
        <Button
          tabIndex={1001}
          ref={refreshRef}
          disabled={isEmpty(servers)}
          onClick={refreshServers}>
          {REFRESH}
        </Button>
      </div>

      <div className='options shareButtons'>{shareButton}</div>
    </div>
  );
};

export default LandingPage;
