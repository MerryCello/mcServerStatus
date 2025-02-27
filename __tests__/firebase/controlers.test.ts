import {auth} from '../../src/firebase/config';
import {doc, getDoc, setDoc, updateDoc} from 'firebase/firestore';
import {onAuthStateChanged, signInAnonymously} from 'firebase/auth';
import {v4 as uuidV4} from 'uuid';
import * as c from '../../src/firebase/controlers';
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

      const servers = await c.getUserServers(
        undefined,
        mockGetUserInfo,
        mockSignIn,
      );

      expect(mockGetUserInfo).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalledWith(
        doc(expect.anything(), 'userServers', 'user123'),
      );
      expect(servers).toEqual([{id: 'server1'}]);
    });

    it('should return empty array if user is not authenticated', async () => {
      const mockGetUserInfo = jest.fn().mockResolvedValueOnce(undefined);
      const mockSignIn = jest.fn().mockResolvedValueOnce(false);

      const servers = await c.getUserServers(
        undefined,
        mockGetUserInfo,
        mockSignIn,
      );

      expect(mockGetUserInfo).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalled();
      expect(servers).toEqual([]);
    });

    it('should initialize user servers if document does not exist', async () => {
      const mockGetUserInfo = jest.fn().mockResolvedValueOnce({id: 'user123'});
      const mockSignIn = jest.fn().mockResolvedValueOnce(false);
      const mockDocSnap = {exists: jest.fn().mockReturnValue(false)};
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const servers = await c.getUserServers(
        undefined,
        mockGetUserInfo,
        mockSignIn,
      );

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

      const result = await c.getUserServersWithAuth(
        undefined,
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
        c.getUserServersWithAuth(undefined, mockGetUserInfo, mockSignIn),
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

      await c.addUserServer(
        {name: mockNewServer.name, address: mockNewServer.address},
        1,
        undefined,
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
        c.addUserServer(
          {name: mockNewServer.name, address: mockNewServer.address},
          1,
          undefined,
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

      await c.editUserServer(
        updatedServer,
        0,
        undefined,
        mockgGetUserServersWithAuth,
      );

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
        c.editUserServer(
          updatedServer,
          undefined,
          undefined,
          mockgGetUserServersWithAuth,
        ),
      ).rejects.toEqual(
        `ID of server by index (-1) and data's ID (server2) do not match`,
      );
    });
  });

  describe('moveUserServer', () => {
    it('should move a server to a new index', async () => {
      const mockServers = [
        {id: 'server1', name: 'Server 1'},
        {id: 'server2', name: 'Server 2'},
        {id: 'server3', name: 'Server 3'},
      ];
      const mockgGetUserServersWithAuth = jest.fn().mockResolvedValueOnce({
        servers: cloneDeep(mockServers),
        docUid: 'user123',
      });

      await c.moveUserServer(0, 2, undefined, mockgGetUserServersWithAuth);

      expect(mockgGetUserServersWithAuth).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        doc(expect.anything(), 'userServers', 'user123'),
        {
          servers: [
            {id: 'server2', name: 'Server 2'},
            {id: 'server3', name: 'Server 3'},
            {id: 'server1', name: 'Server 1'},
          ],
        },
      );
    });

    it('should throw error if old index is out of bounds', async () => {
      const mockServers = [
        {id: 'server1', name: 'Server 1'},
        {id: 'server2', name: 'Server 2'},
      ];
      const mockgGetUserServersWithAuth = jest.fn().mockResolvedValueOnce({
        servers: cloneDeep(mockServers),
        docUid: 'user123',
      });

      await expect(
        c.moveUserServer(-1, 1, undefined, mockgGetUserServersWithAuth),
      ).rejects.toEqual('moveUserServer: old index (-1) out of bounds');
    });

    it('should throw error if new index is out of bounds', async () => {
      const mockServers = [
        {id: 'server1', name: 'Server 1'},
        {id: 'server2', name: 'Server 2'},
      ];
      const mockgGetUserServersWithAuth = jest.fn().mockResolvedValueOnce({
        servers: cloneDeep(mockServers),
        docUid: 'user123',
      });

      await expect(
        c.moveUserServer(0, 3, undefined, mockgGetUserServersWithAuth),
      ).rejects.toEqual('moveUserServer: new index (3) out of bounds');
    });

    it('should throw error if indices are not numbers', async () => {
      const mockServers = [
        {id: 'server1', name: 'Server 1'},
        {id: 'server2', name: 'Server 2'},
      ];
      const mockgGetUserServersWithAuth = jest.fn().mockResolvedValueOnce({
        servers: cloneDeep(mockServers),
        docUid: 'user123',
      });

      await expect(
        c.moveUserServer('a' as any, 1, undefined, mockgGetUserServersWithAuth),
      ).rejects.toEqual(
        'moveUserServer: invalid index - oldIndex: a, newIndex: 1',
      );
    });

    it('should do nothing if old index and new index are the same', async () => {
      const mockServers = [
        {id: 'server1', name: 'Server 1'},
        {id: 'server2', name: 'Server 2'},
      ];
      const mockgGetUserServersWithAuth = jest.fn().mockResolvedValueOnce({
        servers: cloneDeep(mockServers),
        docUid: 'user123',
      });

      await c.moveUserServer(1, 1, undefined, mockgGetUserServersWithAuth);

      expect(mockgGetUserServersWithAuth).not.toHaveBeenCalled();
      expect(updateDoc).not.toHaveBeenCalled();
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

      await c.deleteUserServer(
        'server1',
        undefined,
        mockgGetUserServersWithAuth,
      );

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
        c.deleteUserServer('server2', undefined, mockgGetUserServersWithAuth),
      ).rejects.toEqual('server not found');
    });
  });

  describe('Authentication', () => {
    it('should sign in anonymously', async () => {
      (signInAnonymously as jest.Mock).mockResolvedValueOnce({});
      const result = await c.signIn();
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

      const userInfo = await c.getUserInfo();

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

      const userInfo = await c.getUserInfo();

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(onAuthStateChanged).toHaveBeenCalledWith(
        auth,
        expect.any(Function),
      );
      expect(userInfo).toBeUndefined();
    });

    it('should check if user is signed in', async () => {
      const mockGetUserInfo = jest.fn().mockResolvedValue({id: 'user123'});
      const result = await c.isSignedIn(mockGetUserInfo);
      expect(mockGetUserInfo).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should sign out user', async () => {
      (auth.signOut as jest.Mock).mockResolvedValueOnce({});
      const result = await c.signOut();
      expect(auth.signOut).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle sign out error', async () => {
      jest.spyOn(console, 'error').mockImplementation(noop);
      (auth.signOut as jest.Mock).mockRejectedValueOnce(
        new Error('sign out error'),
      );

      await expect(c.signOut()).rejects.toEqual(false);
    });
  });

  describe('fetchRandomInts', () => {
    it('should return an array of random integers', async () => {
      const mockResponse = '1\n2\n3\n';
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue(mockResponse),
        ok: true,
      });

      const result = await c.fetchRandomInts(1, 3, 3);

      expect(fetch).toHaveBeenCalledWith(
        'https://www.random.org/integers/?min=1&max=3&col=1&num=3&format=plain&base=10&rnd=new',
      );
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle fetch error and throw', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('fetch error'));

      await expect(c.fetchRandomInts(1, 3, 3)).rejects.toThrow(
        new Error('fetch error'),
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://www.random.org/integers/?min=1&max=3&col=1&num=3&format=plain&base=10&rnd=new',
      );
    });

    it('should handle fetch HTTP error and throw', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('Bad Request'),
      });
      global.console.error = jest.fn();

      await expect(c.fetchRandomInts(1, 3, 3)).rejects.toThrow(
        new Error('RNG_ERROR: Failed to fetch random integers'),
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://www.random.org/integers/?min=1&max=3&col=1&num=3&format=plain&base=10&rnd=new',
      );
      expect(console.error).toHaveBeenCalledWith(
        'RNG_ERROR: response status',
        400,
        'Bad Request',
      );
      expect(console.error).toHaveBeenCalledWith(
        'RNG_ERROR: response body',
        'Bad Request',
      );
    });

    it('should handle response with trailing newline', async () => {
      const mockResponse = '1\n2\n3\n';
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue(mockResponse),
        ok: true,
      });

      const result = await c.fetchRandomInts(1, 3, 3);

      expect(fetch).toHaveBeenCalledWith(
        'https://www.random.org/integers/?min=1&max=3&col=1&num=3&format=plain&base=10&rnd=new',
      );
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle response without trailing newline', async () => {
      const mockResponse = '1\n2\n3';
      global.fetch = jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue(mockResponse),
        ok: true,
      });

      const result = await c.fetchRandomInts(1, 3, 3);

      expect(fetch).toHaveBeenCalledWith(
        'https://www.random.org/integers/?min=1&max=3&col=1&num=3&format=plain&base=10&rnd=new',
      );
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('maxCharacter', () => {
    it('should return the highest frequency of any character in the string', () => {
      expect(c.maxCharacter('aabbcc')).toBe(2);
      expect(c.maxCharacter('aabbbcc')).toBe(3);
      expect(c.maxCharacter('abc')).toBe(1);
      expect(c.maxCharacter('')).toBe(0);
    });

    it('should handle strings with special characters', () => {
      expect(c.maxCharacter('aabb!!cc!!')).toBe(4);
      expect(c.maxCharacter('@@@###$$$')).toBe(3);
    });

    it('should handle strings with numbers', () => {
      expect(c.maxCharacter('112233')).toBe(2);
      expect(c.maxCharacter('1112233')).toBe(3);
    });

    it('should handle strings with mixed characters', () => {
      expect(c.maxCharacter('a1b2c3')).toBe(1);
      expect(c.maxCharacter('a1b2c3a')).toBe(2);
    });
  });

  describe('isValidShareUid', () => {
    it('should return true for a valid share UID', () => {
      const validUid = 'a'.repeat(15) + 'b'.repeat(15) + 'c'.repeat(14);
      expect(c.isValidShareUid(validUid)).toBe(true);
    });

    it('should return false for a UID with invalid length', () => {
      const shortUid = 'a'.repeat(43);
      const longUid = 'a'.repeat(45);
      expect(c.isValidShareUid(shortUid)).toBe(false);
      expect(c.isValidShareUid(longUid)).toBe(false);
    });

    it('should return false for a UID with a majority character', () => {
      const majorityCharUid = 'a'.repeat(23) + 'b'.repeat(21);
      expect(c.isValidShareUid(majorityCharUid)).toBe(false);
    });

    it('should return true for a UID with no majority character', () => {
      const noMajorityCharUid = 'a'.repeat(21) + 'b'.repeat(21) + 'c'.repeat(2);
      expect(c.isValidShareUid(noMajorityCharUid)).toBe(true);
    });

    it('should return false for an empty UID', () => {
      expect(c.isValidShareUid('')).toBe(false);
    });
  });

  describe('generateShareUid', () => {
    it('should generate a valid share UID', async () => {
      const mockRandomInts = Array(44)
        .fill(0)
        .map((_, i) => i % 64);
      const mockFetchRandomInts = jest.fn().mockResolvedValue(mockRandomInts);

      const result = await c.generateShareUid(mockFetchRandomInts);

      expect(mockFetchRandomInts).toHaveBeenCalledWith(0, 63, 44);
      expect(result).toHaveLength(44);
      expect(c.isValidShareUid(result)).toBe(true);
    });

    it('should retry until a valid share UID is generated', async () => {
      const invalidRandomInts = Array(41).fill(0).concat([-1, 100, null]);
      const validRandomInts = Array(44)
        .fill(0)
        .map((_, i) => i % 64);
      const mockFetchRandomInts = jest
        .fn()
        .mockResolvedValueOnce(invalidRandomInts)
        .mockResolvedValueOnce(validRandomInts);

      const result = await c.generateShareUid(mockFetchRandomInts);

      expect(mockFetchRandomInts).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(44);
      expect(c.isValidShareUid(result)).toBe(true);
    });

    it('should handle fetchRandomInts failure and not retry', async () => {
      const mockFetchRandomInts = jest
        .fn()
        .mockRejectedValue(new Error('fetch error'));

      await expect(c.generateShareUid(mockFetchRandomInts)).rejects.toThrow(
        new Error('fetch error'),
      );

      expect(mockFetchRandomInts).toHaveBeenCalledTimes(1);
    });
  });
});
