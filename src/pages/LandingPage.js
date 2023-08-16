import "../App.css";
import { useEffect, useMemo, useRef, useState } from "react";
import request from "superagent";
import ServerCard from "../components/ServerCard";
import Button from "../components/Button";
import { getUserServers } from "../firebase/controlers";

const loadingObj = { loading: true };
const EDIT = "Edit";
const DELETE = "Delete";
const ADD_SERVER = "Add Server";
const REFRESH = "Refresh";
const NO_SERVERS_LOADER_STATES = ["O o o", "o O o", "o o O", "o O o"];

const LandingPage = () => {
  const [servers, setServers] = useState([]);
  const [srvSelIndex, setSrvSelIndex] = useState(null);
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

  const serverCardSelect = (index) => {
    setEditDisabled(false);
    setDeleteDisabled(false);
    setSrvSelIndex(index);
  };

  const serverCardOnBlur = (event) => {
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

  const updateServerStatusState = (serverId, srvStatus) => {
    setServers((prevServers) => {
      let updatedServers = prevServers;
      let i = updatedServers.findIndex(
        (srv) => String(srv.id) === String(serverId)
      );
      updatedServers[i] = {
        ...updatedServers[i],
        status: srvStatus,
      };

      // deconstruct to copy array so it rerenders
      return [...updatedServers];
    });
  };

  const updateServersStatus = (srvs) => {
    for (let i = 0; i < srvs.length; i++) {
      const server = srvs[i];
      // the function here is to preserve the value of i in the async request callback
      ((srv) => {
        const startTime = Date.now();
        request
          .get("https://api.mcsrvstat.us/2/" + srv.address)
          .then((res) => {
            // pingAvgMs - not actual ping
            const pingAvgMs = Date.now() - startTime;
            updateServerStatusState(srv.id, { ...res?.body, pingAvgMs });
          })
          .catch((e) => {
            updateServerStatusState(srv.id, {
              error: e,
              online: false,
              loading: false,
            });
            console.log(e);
          });
      })({ ...server });
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

  const serversList = useMemo(() => {
    if (servers.length === 0) {
      return renderLoadingState();
    }
    return renderServerCards();
  }, [servers.length, ...servers, noServersLoaderIndex]);

  const refreshServers = () => {
    let serversRst = [];
    for (const server of servers) {
      serversRst.push({
        ...server,
        status: { ...loadingObj, icon: server.status?.icon },
      });
    }
    setServers(serversRst);
    updateServersStatus(servers);
  };

  return (
    <div className="main-container landing-container">
      <h1>Server Status</h1>
      <div className="servers-list-bg">
        <div className="servers-list">{serversList}</div>
      </div>
      <div className="options">
        <Button
          ref={editRef}
          disabled={editDisabled}
          linkTo="/mcServerStatus/edit"
          state={{
            id: servers[srvSelIndex]?.id,
            name: servers[srvSelIndex]?.name,
            address: servers[srvSelIndex]?.address,
          }}
        >
          {EDIT}
        </Button>
        <Button
          ref={deleteRef}
          disabled={deleteDisabled}
          linkTo="/mcServerStatus/delete"
          state={{
            id: servers[srvSelIndex]?.id,
            name: servers[srvSelIndex]?.name,
          }}
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
