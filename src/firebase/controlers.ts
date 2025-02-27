/**
 * Set of functions that retain firestore architecture as designed.
 * Also has firebase util functions.
 */

import {doc, getDoc, setDoc, updateDoc} from 'firebase/firestore';
import {auth, db} from './config';
import {onAuthStateChanged, signInAnonymously} from 'firebase/auth';
import {isNil, isNumber, noop, omit} from 'lodash';
import {v4 as uuidV4} from 'uuid';
import {ServerData} from './types';
import {indexIsOutOfBounds, moveItemInArray} from '../utils';

const USER_SERVERS_COL = 'userServers';
const SHARED_SERVERS_COL = 'sharedServers';

// ========================== GET SERVERS ========================== //
/**
 * Get all the user's servers
 * @returns list of server details
 */
export const getUserServers = async (
  sharedListId?: string,
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
  docUid = sharedListId ?? docUid;
  const docRef = doc(
    db,
    sharedListId ? SHARED_SERVERS_COL : USER_SERVERS_COL,
    docUid!,
  );
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().servers;
  } else if (sharedListId) {
    throw 'SHARE_ID_NOT_FOUND';
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
  sharedListId?: string,
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
  docUid = sharedListId ?? docUid;

  return {servers: await getUserServersLocal(docUid), docUid};
};

/**
 * @param data server details
 * @param index array index for ordering servers
 */
export const addUserServer = async (
  data: ServerData,
  index?: number,
  sharedListId?: string,
  getUserServersWithAuthLocal = getUserServersWithAuth,
): Promise<void> => {
  data['id'] = uuidV4();
  const {servers, docUid} = await getUserServersWithAuthLocal(sharedListId);

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
  sharedListId?: string,
  getUserServersWithAuthLocal = getUserServersWithAuth,
): Promise<void> => {
  const {servers, docUid} = await getUserServersWithAuthLocal(sharedListId);

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
  sharedListId?: string,
  getUserServersWithAuthLocal = getUserServersWithAuth,
): Promise<void> => {
  if (oldIndex === newIndex) {
    return;
  }
  if (typeof oldIndex !== 'number' || typeof newIndex !== 'number') {
    throw `moveUserServer: invalid index - oldIndex: ${oldIndex}, newIndex: ${newIndex}`;
  }

  const {servers, docUid} = await getUserServersWithAuthLocal(sharedListId);

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
  sharedListId?: string,
  getUserServersWithAuthLocal = getUserServersWithAuth,
): Promise<void> => {
  const {servers, docUid} = await getUserServersWithAuthLocal(sharedListId);

  const index = servers.findIndex((server) => server.id === id);

  if (isNil(servers[index])) {
    throw 'server not found';
  }
  servers.splice(index, 1);

  return updateDoc(doc(db, USER_SERVERS_COL, docUid!), {servers});
};

// ========================== SHARE ID ========================== //

const UID_LENGTH = 44;
const UID_POSSIBLE_CHARS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';

/**
 * Fetches an array of random integers from the random.org API.
 * @param min - The minimum value for the random integers.
 * @param max - The maximum value for the random integers.
 * @param num - The number of random integers to fetch.
 * @returns A promise that resolves to an array of random integers.
 * @throws Will log an error to the console if the fetch operation fails.
 */
export const fetchRandomInts = async (
  min: number,
  max: number,
  num: number,
): Promise<number[]> => {
  let result: number[] = [];
  let res: Response | null = null;

  try {
    res = await fetch(
      `https://www.random.org/integers/?min=${min}&max=${max}&col=1&num=${num}&format=plain&base=10&rnd=new`,
    );
    const data: string = await res.text();
    if (!res?.ok) {
      throw new Error('RNG_ERROR: Failed to fetch random integers');
    }

    let convBody = data;
    if (convBody[convBody.length - 1] === '\n') {
      convBody = convBody.slice(0, -1);
    }
    result = convBody.split('\n').map((num: string) => Number(num));
  } catch (error) {
    console.error('RNG_ERROR: response status', res?.status, res?.statusText);
    try {
      console.error('RNG_ERROR: response body', await res?.text());
    } catch {
      noop();
    }
    throw error;
  }
  return result;
};

/**
 * Returns the character that appears the most in the given string.
 * @param str - The string to analyze.
 * @returns The character that appears the most in the string.
 */
export const maxCharacter = (str: string): number => {
  const charMap: Record<string, number> = {};
  let max = 0;

  for (let char of str) {
    charMap[char] = charMap[char] + 1 || 1;
  }

  for (let char in charMap) {
    if (charMap[char] > max) {
      max = charMap[char];
    }
  }

  return max;
};

/**
 * Checks if the given string is a valid share UID.
 * @param uid - The string to check.
 * @returns Whether the string is a valid share UID.
 */
export const isValidShareUid = (uid: string): boolean => {
  const hasValidLength = uid.length === UID_LENGTH;
  const noSingleCharHasMajority = maxCharacter(uid) < uid.length / 2;
  const hasValidChars = uid
    .split('')
    .every((char) => UID_POSSIBLE_CHARS.includes(char));

  return hasValidLength && noSingleCharHasMajority && hasValidChars;
};

/**
 * Generates a valid share UID.
 * @returns A promise that resolves to a valid share UID.
 */
export const generateShareUid = async (
  fetchRandomIntsLocal = fetchRandomInts,
): Promise<string> => {
  let result: string = '';
  let randomInts: number[] = [];
  let randomIntsSuccess = false;

  do {
    result = '';
    randomInts = await fetchRandomIntsLocal(
      0,
      UID_POSSIBLE_CHARS.length - 1,
      UID_LENGTH,
    );
    randomIntsSuccess = randomInts?.length === UID_LENGTH;

    for (const rndInt of randomInts) {
      const isRndIntInScope =
        isNumber(rndInt) && rndInt >= 0 && rndInt < UID_POSSIBLE_CHARS.length;
      result += UID_POSSIBLE_CHARS[isRndIntInScope ? rndInt : 0];
    }
  } while (randomIntsSuccess && !isValidShareUid(result));

  return result;
};

// ========================== AUTH ========================== //

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
