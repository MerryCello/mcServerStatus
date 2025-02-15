/**
 * Set of functions that retain firestore architecture as designed.
 * Also has firebase util functions.
 */

import {doc, getDoc, setDoc, updateDoc} from 'firebase/firestore';
import {auth, db} from './config';
import {onAuthStateChanged, signInAnonymously} from 'firebase/auth';
import {isNil, omit} from 'lodash';
import {v4 as uuidV4} from 'uuid';
import {ServerData} from './types';
import {indexIsOutOfBounds, moveItemInArray} from '../utils';

const USER_SERVERS_COL = 'userServers';

// ==========================GET SERVERS==========================
/**
 * Get all the user's servers
 * @returns list of server details
 */
export const getUserServers = async (
  getUserInfoLocal = getUserInfo,
  signInLocal = signIn,
): Promise<ServerData[]> => {
  let docUid = (await getUserInfoLocal())?.id;
  if (!docUid) {
    if (await signInLocal()) {
      docUid = (await getUserInfoLocal())?.id;
    } else {
      return [];
    }
  }
  const docRef = doc(db, USER_SERVERS_COL, docUid!);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().servers;
  } else {
    //  initial user servers
    setDoc(docRef, {servers: []});
    return [];
  }
};

/**
 * Utility function for add/edit/deleteUserServer functions
 */
export const getUserServersWithAuth = async (
  getUserInfoLocal = getUserInfo,
  signInLocal = signIn,
  getUserServersLocal = getUserServers,
) => {
  let docUid = (await getUserInfoLocal())?.id;
  if (!docUid) {
    if (!(await signInLocal())) {
      throw 'unable to authenticate';
    }
    docUid = (await getUserInfoLocal())?.id;
  }

  return {servers: await getUserServersLocal(), docUid};
};

/**
 * @param data server details
 * @param index array index for ordering servers
 */
export const addUserServer = async (
  data: ServerData,
  index?: number,
  getUserServersWithAuthLocal = getUserServersWithAuth,
): Promise<void> => {
  data['id'] = uuidV4();
  const {servers, docUid} = await getUserServersWithAuthLocal();

  // validate data
  const isInvalidData = !!servers.find((server) => server.id === data?.id);

  if (isInvalidData) {
    throw 'invalid data';
  }

  // insert new server
  if (!isNil(index) && index! < 0) {
    servers.unshift(data);
  } else if (typeof index != 'number' || index >= servers.length) {
    servers.push(data);
  } else {
    servers.splice(index, 0, data);
  }

  return updateDoc(doc(db, USER_SERVERS_COL, docUid!), {servers});
};

/**
 * @param data server details to update
 * @param index array index for ordering servers
 */
export const editUserServer = async (
  data: ServerData,
  index?: number,
  getUserServersWithAuthLocal = getUserServersWithAuth,
): Promise<void> => {
  const {servers, docUid} = await getUserServersWithAuthLocal();

  // Invalid index?
  if (isNil(index) || isNil(servers[index])) {
    // Try finding the server to edit a different way
    index = servers.findIndex((server) => server.id === data?.id);
    // Still invalid?
    if (
      isNil(index) ||
      isNil(servers[index]) ||
      servers[index]?.id !== data?.id
    ) {
      throw `ID of server by index (${
        servers[index]?.id ?? index
      }) and data's ID (${data?.id}) do not match`;
    }
  }
  servers[index] = {...servers[index], ...omit(data, ['id'])};

  return updateDoc(doc(db, USER_SERVERS_COL, docUid!), {servers});
};

/**
 * @param oldIndex server index to move
 * @param newIndex new index for the server
 */
export const moveUserServer = async (
  oldIndex: number,
  newIndex: number,
  getUserServersWithAuthLocal = getUserServersWithAuth,
): Promise<void> => {
  if (oldIndex === newIndex) {
    return;
  }
  if (typeof oldIndex !== 'number' || typeof newIndex !== 'number') {
    throw `moveUserServer: invalid index - oldIndex: ${oldIndex}, newIndex: ${newIndex}`;
  }

  const {servers, docUid} = await getUserServersWithAuthLocal();

  if (indexIsOutOfBounds(servers, oldIndex)) {
    throw `moveUserServer: old index (${oldIndex}) out of bounds`;
  }
  if (indexIsOutOfBounds(servers, newIndex)) {
    throw `moveUserServer: new index (${newIndex}) out of bounds`;
  }

  return updateDoc(doc(db, USER_SERVERS_COL, docUid!), {
    servers: moveItemInArray(servers, oldIndex, newIndex),
  });
};

/**
 * @param id server ID
 */
export const deleteUserServer = async (
  id: string,
  getUserServersWithAuthLocal = getUserServersWithAuth,
): Promise<void> => {
  const {servers, docUid} = await getUserServersWithAuthLocal();

  const index = servers.findIndex((server) => server.id === id);

  if (isNil(servers[index])) {
    throw 'server not found';
  }
  servers.splice(index, 1);

  return updateDoc(doc(db, USER_SERVERS_COL, docUid!), {servers});
};

// ========================== AUTH ==========================

export const signIn = (): Promise<boolean> =>
  new Promise((resolve, reject) => {
    signInAnonymously(auth)
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const getUserInfo = (): Promise<{id: string} | undefined> =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
        console.error('Unable to get user info:', e);
        resolve(userInfo);
      }
    });
  });

export const isSignedIn = async (
  getUserInfoLocal = getUserInfo,
): Promise<boolean> => !!(await getUserInfoLocal());

export const signOut = (): Promise<boolean> =>
  new Promise((resolve, reject) => {
    auth
      .signOut()
      .then(() => resolve(true))
      .catch((e) => {
        console.error('Unable to sign out:', e);
        reject(false);
      });
  });
