import {auth} from '../../src/firebase/config';
import {doc, getDoc, setDoc, updateDoc} from 'firebase/firestore';
import {onAuthStateChanged, signInAnonymously} from 'firebase/auth';
import {v4 as uuidV4} from 'uuid';

import {
  getUserServers,
  addUserServer,
  editUserServer,
  deleteUserServer,
  signIn,
  getUserInfo,
  isSignedIn,
  signOut,
  getUserServersWithAuth,
} from '../../src/firebase/controlers';
import {cloneDeep, noop} from 'lodash';

jest.mock('firebase/firestore');
jest.mock('firebase/auth');
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));
jest.mock('../../src/firebase/config', () => ({
  auth: {signOut: jest.fn()},
  db: {},
}));

describe('Firebase Controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserServers', () => {
    it('should return user servers if user is authenticated', async () => {
      const mockGetUserInfo = jest.fn().mockResolvedValueOnce({id: 'user123'});
      const mockSignIn = jest.fn().mockResolvedValueOnce(true);
      const mockDocSnap = {
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue({servers: [{id: 'server1'}]}),
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const servers = await getUserServers(mockGetUserInfo, mockSignIn);

      expect(mockGetUserInfo).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalledWith(
        doc(expect.anything(), 'userServers', 'user123'),
      );
      expect(servers).toEqual([{id: 'server1'}]);
    });

    it('should return empty array if user is not authenticated', async () => {
      const mockGetUserInfo = jest.fn().mockResolvedValueOnce(undefined);
      const mockSignIn = jest.fn().mockResolvedValueOnce(false);

      const servers = await getUserServers(mockGetUserInfo, mockSignIn);

      expect(mockGetUserInfo).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalled();
      expect(servers).toEqual([]);
    });

    it('should initialize user servers if document does not exist', async () => {
      const mockGetUserInfo = jest.fn().mockResolvedValueOnce({id: 'user123'});
      const mockSignIn = jest.fn().mockResolvedValueOnce(false);
      const mockDocSnap = {exists: jest.fn().mockReturnValue(false)};
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const servers = await getUserServers(mockGetUserInfo, mockSignIn);

      expect(mockGetUserInfo).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalledWith(
        doc(expect.anything(), 'userServers', 'user123'),
      );
      expect(setDoc).toHaveBeenCalledWith(
        doc(expect.anything(), 'userServers', 'user123'),
        {servers: []},
      );
      expect(servers).toEqual([]);
    });
  });

  describe('getUserServersWithAuth', () => {
    it('should return the servers', async () => {
      const mockUserMetadata = {id: 'user123'};
      const mockServers = [
        {id: 'server1', name: 'Excisting Server', address: '321.321.321.321'},
      ];
      const mockGetUserInfo = jest.fn().mockResolvedValueOnce(mockUserMetadata);
      const mockGetUserServers = jest.fn().mockResolvedValueOnce(mockServers);
      const mockSignIn = jest.fn().mockResolvedValueOnce(true);

      const result = await getUserServersWithAuth(
        mockGetUserInfo,
        mockSignIn,
        mockGetUserServers,
      );

      expect(result).toEqual({
        servers: mockServers,
        docUid: mockUserMetadata.id,
      });
    });

    it('should throw error if unable to authenticate', async () => {
      const mockGetUserInfo = jest.fn().mockResolvedValueOnce(undefined);
      const mockSignIn = jest.fn().mockResolvedValueOnce(false);

      await expect(
        getUserServersWithAuth(mockGetUserInfo, mockSignIn),
      ).rejects.toEqual('unable to authenticate');
    });
  });

  describe('addUserServer', () => {
    it('should add a new server to user servers', async () => {
      const mockServers = [
        {id: 'server1', name: 'Excisting Server', address: '321.321.321.321'},
      ];
      const mockNewServer = {
        id: 'new-server-id',
        name: 'New Server',
        address: '123.123.123.123',
      };
      const mockgGetUserServersWithAuth = jest
        .fn()
        .mockResolvedValueOnce({servers: mockServers, docUid: 'user123'});
      (uuidV4 as jest.Mock).mockReturnValue(mockNewServer.id);

      await addUserServer(
        {name: mockNewServer.name, address: mockNewServer.address},
        1,
        mockgGetUserServersWithAuth,
      );

      expect(mockgGetUserServersWithAuth).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        doc(expect.anything(), 'userServers', 'user123'),
        {servers: [mockServers[0], mockNewServer]},
      );
    });

    it('should throw error if server data is invalid', async () => {
      const mockServers = [
        {id: 'server1', name: 'Excisting Server', address: '321.321.321.321'},
      ];
      const mockNewServer = {
        name: 'New Server',
        address: '123.123.123.123',
      };
      const mockgGetUserServersWithAuth = jest
        .fn()
        .mockResolvedValueOnce({servers: mockServers, docUid: 'user123'});
      (uuidV4 as jest.Mock).mockReturnValue(mockServers[0].id);

      await expect(
        addUserServer(
          {name: mockNewServer.name, address: mockNewServer.address},
          1,
          mockgGetUserServersWithAuth,
        ),
      ).rejects.toEqual('invalid data');
    });
  });

  describe('editUserServer', () => {
    it('should edit an existing server', async () => {
      const mockServers = [
        {id: 'server1', name: 'Old Server', address: '321.321.321.321'},
      ];
      const updatedServer = {
        ...mockServers[0],
        name: 'Updated Server',
        address: '123.123.123.123',
      };
      const mockgGetUserServersWithAuth = jest
        .fn()
        .mockResolvedValueOnce({servers: mockServers, docUid: 'user123'});

      await editUserServer(updatedServer, 0, mockgGetUserServersWithAuth);

      expect(mockgGetUserServersWithAuth).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        doc(expect.anything(), 'userServers', 'user123'),
        {servers: [updatedServer]},
      );
    });

    it('should throw error if server ID does not match', async () => {
      const mockServers = [
        {id: 'server1', name: 'Old Server', address: '321.321.321.321'},
      ];
      const updatedServer = {
        id: 'server2',
        name: 'Updated Server',
        address: '123.123.123.123',
      };
      const mockgGetUserServersWithAuth = jest
        .fn()
        .mockResolvedValueOnce({servers: mockServers, docUid: 'user123'});

      await expect(
        editUserServer(updatedServer, undefined, mockgGetUserServersWithAuth),
      ).rejects.toEqual(
        `ID of server by index (-1) and data's ID (server2) do not match`,
      );
    });
  });

  describe('deleteUserServer', () => {
    it('should delete an existing server', async () => {
      const mockServers = [
        {id: 'server1', name: 'Old Server'},
        {id: 'server2', name: 'Old Server'},
      ];
      const mockgGetUserServersWithAuth = jest.fn().mockResolvedValueOnce({
        servers: cloneDeep(mockServers),
        docUid: 'user123',
      });

      await deleteUserServer('server1', mockgGetUserServersWithAuth);

      expect(mockgGetUserServersWithAuth).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        doc(expect.anything(), 'userServers', 'user123'),
        {
          servers: [mockServers[1]],
        },
      );
    });

    it('should throw error if server not found', async () => {
      const mockServers = [{id: 'server1', name: 'Old Server'}];
      const mockgGetUserServersWithAuth = jest.fn().mockResolvedValueOnce({
        servers: cloneDeep(mockServers),
        docUid: 'user123',
      });

      await expect(
        deleteUserServer('server2', mockgGetUserServersWithAuth),
      ).rejects.toEqual('server not found');
    });
  });

  describe('Authentication', () => {
    it('should sign in anonymously', async () => {
      (signInAnonymously as jest.Mock).mockResolvedValueOnce({});
      const result = await signIn();
      expect(signInAnonymously).toHaveBeenCalledWith(auth);
      expect(result).toBe(true);
    });

    it('should handle sign in error', async () => {
      (signInAnonymously as jest.Mock).mockRejectedValueOnce(
        new Error('sign in error'),
      );

      const actualSignIn = jest.requireActual(
        '../../src/firebase/controlers',
      ).signIn;
      await expect(actualSignIn()).rejects.toThrow('sign in error');
    });

    it('should get user info if signed in', async () => {
      const mockUser = {uid: 'user123'};
      const mockUnsubscribe = jest.fn();
      (onAuthStateChanged as jest.Mock).mockImplementation((_, callback) => {
        setTimeout(() => callback(mockUser), 50);
        return mockUnsubscribe;
      });

      const userInfo = await getUserInfo();

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(onAuthStateChanged).toHaveBeenCalledWith(
        auth,
        expect.any(Function),
      );
      expect(userInfo).toEqual({id: 'user123'});
    });

    it('should return undefined if not signed in', async () => {
      const mockUnsubscribe = jest.fn();
      (onAuthStateChanged as jest.Mock).mockImplementation((_, callback) => {
        setTimeout(() => callback(null), 50);
        return mockUnsubscribe;
      });

      const userInfo = await getUserInfo();

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(onAuthStateChanged).toHaveBeenCalledWith(
        auth,
        expect.any(Function),
      );
      expect(userInfo).toBeUndefined();
    });

    it('should check if user is signed in', async () => {
      const mockGetUserInfo = jest.fn().mockResolvedValue({id: 'user123'});
      const result = await isSignedIn(mockGetUserInfo);
      expect(mockGetUserInfo).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should sign out user', async () => {
      (auth.signOut as jest.Mock).mockResolvedValueOnce({});
      const result = await signOut();
      expect(auth.signOut).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle sign out error', async () => {
      jest.spyOn(console, 'error').mockImplementation(noop);
      (auth.signOut as jest.Mock).mockRejectedValueOnce(
        new Error('sign out error'),
      );

      await expect(signOut()).rejects.toEqual(false);
    });
  });
});
