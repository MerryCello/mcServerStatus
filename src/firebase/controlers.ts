/**
 * Set of functions that retain firestore architecture as designed.
 * Also has firebase util functions.
 */

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./config";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { isNil } from "../utils";
import { v4 as uuidV4 } from "uuid";
import { ServerData } from "./types";

const USER_SERVERS_COL = "userServers";

// ==========================GET SERVERS==========================
/**
 * Get all the user's servers
 * @returns list of server details
 */
export const getUserServers = (): Promise<ServerData[]> =>
  new Promise(async (resolve) => {
    let docUid = (await getUserInfo())?.id;
    if (!docUid) {
      if (await signIn()) {
        docUid = (await getUserInfo())?.id;
      } else {
        resolve([]);
      }
    }
    const docRef = doc(db, USER_SERVERS_COL, docUid!);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      resolve(docSnap.data().servers);
    } else {
      //  initial user servers
      setDoc(docRef, { servers: [] });
      resolve([]);
    }
  });

/**
 * @param data server details
 * @param index array index for ordering servers
 */
export const addUserServer = (
  data: ServerData,
  index?: number
): Promise<void> =>
  new Promise(async (resolve, reject) => {
    data["id"] = uuidV4();
    let docUid = (await getUserInfo())?.id;
    if (!docUid) {
      if (await signIn()) {
        docUid = (await getUserInfo())?.id;
      } else {
        reject("unable to authenticate");
      }
    }

    let servers = await getUserServers();
    // validate data
    let isValidData = true;
    for (const server of servers) {
      if (server.id === data?.id) {
        isValidData = false;
      }
    }
    if (!isValidData) {
      reject("invalid data");
    }

    // insert new server
    if (!isNil(index) && index! < 0) {
      servers.unshift(data);
    } else if (typeof index != "number" || index >= servers.length) {
      servers.push(data);
    } else {
      servers.splice(index, 0, data);
    }

    resolve(updateDoc(doc(db, USER_SERVERS_COL, docUid!), { servers }));
  });

/**
 * @param data server details to update
 * @param index array index for ordering servers
 */
export const editUserServer = (
  data: ServerData,
  index?: number
): Promise<void> =>
  new Promise(async (resolve, reject) => {
    let docUid = (await getUserInfo())?.id;
    if (!docUid) {
      if (await signIn()) {
        docUid = (await getUserInfo())?.id;
      } else {
        reject("unable to authenticate");
      }
    }

    let servers = await getUserServers();

    // Invalid index?
    if (isNil(index) || isNil(servers[index!])) {
      // Try finding the server to edit a different way
      index = servers.findIndex((server) => server.id === data.id);
      // Still invalid?
      if (
        isNil(index) ||
        isNil(servers[index]) ||
        servers[index]?.id !== data?.id
      ) {
        reject(
          `ID of server by index (${servers[index]?.id}) and data's ID (${data?.id}) do not match`
        );
      }
    }
    delete data?.id; // remove ID to keep the one in 'servers'
    servers[index!] = { ...servers[index!], ...data };

    resolve(updateDoc(doc(db, USER_SERVERS_COL, docUid!), { servers }));
  });

/**
 * @param id server ID
 */
export const deleteUserServer = (id: string) =>
  new Promise(async (resolve, reject) => {
    let docUid = (await getUserInfo())?.id;
    if (!docUid) {
      if (await signIn()) {
        docUid = (await getUserInfo())?.id;
      } else {
        reject("unable to authenticate");
      }
    }

    let servers = await getUserServers();
    const index = servers.findIndex((server) => server.id === id);

    if (isNil(servers[index])) {
      reject("server not found");
    }
    servers.splice(index, 1);

    resolve(updateDoc(doc(db, USER_SERVERS_COL, docUid!), { servers }));
  });

// ========================== AUTH ==========================

export const signIn = () =>
  new Promise(async (resolve, reject) => {
    signInAnonymously(auth)
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const getUserInfo = (): Promise<{ id: string } | undefined> =>
  new Promise(async (resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      let userInfo = undefined;
      try {
        if (user) {
          userInfo = {
            id: user.uid,
          };
        }
        resolve(userInfo);
      } catch (e) {
        console.error("Unable to get user info:", e);
        resolve(userInfo);
      }
    });
  });

export const isSignedIn = async (): Promise<boolean> => !!(await getUserInfo());

export const signOut = (): Promise<boolean> =>
  new Promise(async (resolve, reject) => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error("Unable to sign out:", e);
      reject(false);
    }

    resolve(true);
  });
