import "../App.css";
import { useEffect, useRef, useState } from "react";
import request from "superagent";
import ServerCard from "../components/ServerCard";
import Button from "../components/Button";
import { getUserServers } from "../firebase/controlers";
import { ServerData } from "../firebase/types";
import { ServerStatus } from "../types";

const loadingObj: ServerStatus = { loading: true };
const EDIT = "Edit";
const DELETE = "Delete";
const ADD_SERVER = "Add Server";
const REFRESH = "Refresh";
const NO_SERVERS_LOADER_STATES = ["O o o", "o O o", "o o O", "o O o"];

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
  const [noServersLoaderIndex, setNoServersLoaderIndex] = useState(0);
  const addServerRef = useRef(null);
  const refreshRef = useRef(null);

  useEffect(() => {
    const interval = setLoadingInterval();
    getUserServers().then((serversResponse) => {
      const serversWithLoading = serversResponse.map((server) => ({
        ...server,
        status: loadingObj,
      }));
      setServers(serversWithLoading);
      updateServersStatus(serversWithLoading);
    });

    return () => clearInterval(interval);
  }, []);

  const serverCardSelect = (index: any) => {
    setEditDisabled(false);
    setDeleteDisabled(false);
    setSrvSelIndex(index);
  };

  const serverCardOnBlur = (event: any) => {
    const element = event?.relatedTarget;
    const elementText = element?.innerHTML;
    // TODO: find better solution than this
    if (
      !(
        elementText === EDIT ||
        elementText === DELETE ||
        element?.classList?.contains("card-grid")
      )
    ) {
      setSrvSelIndex(null);
      setEditDisabled(true);
      setDeleteDisabled(true);
    }
  };

  const updateServerStatusState = (
    serverId: string | undefined,
    srvStatus: ServerStatus
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
        .get("https://api.mcsrvstat.us/2/" + srv.address)
        .then((res) => {
          // pingAvgMs - not actual ping
          const pingAvgMs = Date.now() - startTime;
          updateServerStatusState(srv.id, { ...res?.body, pingAvgMs });
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
        () =>
          updateServerStatusState(srv.id, { ...srv?.status, loading: false }),
        500
      );
    }
  };

  const updateServersStatus = (srvs: Server[]) => {
    for (const server of srvs) {
      fetchMcsrvstat({ ...server });
    }
  };

  const setLoadingInterval = () => {
    const interval = setInterval(() => {
      if (servers.length === 0) {
        // Have to use setState function to get the actual state of 'noServersLoader'
        // because 'noServersLoader' variable will not show the actual value in the
        // setInterval scope.
        setNoServersLoaderIndex(
          (prevState) => (prevState + 1) % NO_SERVERS_LOADER_STATES.length
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

  const renderLoadingState = () => (
    <div title="(Doesn't actually scan)">
      <h1 style={{ marginBottom: "0px", marginTop: "25px" }}>
        {"Scanning for games on your local network"}
      </h1>
      <h1 style={{ color: "#7e7e7e", textShadow: "none" }}>
        {NO_SERVERS_LOADER_STATES[noServersLoaderIndex]}
      </h1>
    </div>
  );

  const renderServerCards = () =>
    servers.map(({ name, address, status }, i) => (
      <ServerCard
        onFocus={serverCardSelect}
        onBlur={serverCardOnBlur}
        key={i}
        tabIndex={i + 1}
        index={i}
        style={{ marginBottom: "8px" }}
        name={name}
        address={address}
        status={status}
      />
    ));

  const renderServersList = () => {
    if (servers.length === 0) {
      return renderLoadingState();
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
            ? { ...loadingObj, icon: server.status?.icon }
            : { ...server.status, ...loadingObj },
      };
    });
    setServers(serverRst);
    updateServersStatus(serverRst);
  };

  return (
    <div className="main-container landing-container">
      <h1>Server Status</h1>
      <div className="servers-list-bg">
        <div className="servers-list">{renderServersList()}</div>
      </div>
      <div className="options">
        <Button
          ref={editRef}
          disabled={editDisabled}
          linkTo="/mcServerStatus/edit"
          state={
            srvSelIndex && {
              id: servers[srvSelIndex]?.id,
              name: servers[srvSelIndex]?.name,
              address: servers[srvSelIndex]?.address,
            }
          }
        >
          {EDIT}
        </Button>
        <Button
          ref={deleteRef}
          disabled={deleteDisabled}
          linkTo="/mcServerStatus/delete"
          state={
            srvSelIndex && {
              id: servers[srvSelIndex]?.id,
              name: servers[srvSelIndex]?.name,
            }
          }
        >
          {DELETE}
        </Button>
        <Button
          tabIndex={1000}
          ref={addServerRef}
          linkTo={"/mcServerStatus/add"}
        >
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
