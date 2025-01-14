import {
  getAnalytics as getAnalyticsInstance,
  initializeFirebase,
} from '../../src/firebase/config';
import {initializeApp, getApp} from 'firebase/app';
import {getFirestore, connectFirestoreEmulator} from 'firebase/firestore';
import {getAuth, connectAuthEmulator} from 'firebase/auth';
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from 'firebase/analytics';

jest.mock('firebase/app');
jest.mock('firebase/firestore');
jest.mock('firebase/auth');
jest.mock('firebase/analytics');

describe('initializeFirebase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize firebase with production config', () => {
    // process.env.NODE_ENV = 'production';
    // initializeFirebase();
    initializeFirebase('prod');

    expect(initializeApp).toHaveBeenCalledWith({
      apiKey: expect.any(String),
      authDomain: 'mc-server-status-256.firebaseapp.com',
      projectId: 'mc-server-status-256',
      storageBucket: 'mc-server-status-256.appspot.com',
      messagingSenderId: '416340134508',
      appId: expect.any(String),
      measurementId: 'G-Q2W3XCMWZW',
    });
    expect(getFirestore).toHaveBeenCalled();
    expect(getAuth).toHaveBeenCalled();
  });

  it('should initialize firebase with development config', () => {
    // process.env.NODE_ENV = 'development';
    // initializeFirebase();
    initializeFirebase('dev');

    expect(initializeApp).toHaveBeenCalledWith({
      apiKey: expect.any(String),
      authDomain: 'mc-server-status-256.firebaseapp.com',
      projectId: 'mc-server-status-256',
      storageBucket: 'mc-server-status-256.appspot.com',
      messagingSenderId: '416340134508',
      appId: expect.any(String),
      measurementId: 'G-Q2W3XCMWZW',
    });
    expect(getFirestore).toHaveBeenCalled();
    expect(getAuth).toHaveBeenCalled();
  });

  it('should initialize firebase with local config', () => {
    (getFirestore as jest.Mock).mockReturnValueOnce('firestore');
    (getAuth as jest.Mock).mockReturnValueOnce('auth');
    // process.env.NODE_ENV = 'local';
    // initializeFirebase();
    initializeFirebase('local');

    expect(initializeApp).toHaveBeenCalledWith({
      apiKey: expect.any(String),
      authDomain: 'http://localhost:4400',
      databaseURL: 'http://localhost:4400',
      projectId: 'local',
      storageBucket: expect.any(String),
      appId: '1:123456789011:web:blahblahblahblahblahbl',
      measurementId: 'G-BLAHBLAHBL',
    });
    expect(getFirestore).toHaveBeenCalled();
    expect(getAuth).toHaveBeenCalled();
    expect(connectFirestoreEmulator).toHaveBeenCalledWith(
      expect.anything(),
      'http://localhost',
      8080,
    );
    expect(connectAuthEmulator).toHaveBeenCalledWith(
      expect.anything(),
      'http://localhost:8080',
    );
  });

  it('should handle firebase initialization "already exists" error', () => {
    (initializeApp as jest.Mock).mockImplementation(() => {
      throw new Error('already exists');
    });
    (getApp as jest.Mock).mockReturnValueOnce('app');
    (getFirestore as jest.Mock).mockReturnValueOnce('firestore');
    (getAuth as jest.Mock).mockReturnValueOnce('auth');

    const result = initializeFirebase();

    expect(getApp).toHaveBeenCalled();
    expect(result.firebase).toBe('app');
    expect(result.firestore).toBe('firestore');
    expect(result.auth).toBe('auth');
  });

  it('should log error if error is not "already exists"', () => {
    (initializeApp as jest.Mock).mockImplementation(() => {
      throw new Error('did not compute');
    });
    (getApp as jest.Mock).mockReturnValueOnce(undefined);
    (getFirestore as jest.Mock).mockReturnValueOnce(undefined);
    (getAuth as jest.Mock).mockReturnValueOnce(undefined);
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = initializeFirebase();

    expect(console.error).toHaveBeenCalled();
    expect(getApp).toHaveBeenCalled();
    expect(result.firebase).toBeUndefined();
    expect(result.firestore).toBeUndefined();
    expect(result.auth).toBeUndefined();
  });

  it('should initialize prod analytics if supported', async () => {
    (isAnalyticsSupported as jest.Mock).mockResolvedValueOnce(true);
    (getAnalytics as jest.Mock).mockResolvedValueOnce('analytics');
    // process.env.NODE_ENV = 'production';
    // const analytics = getAnalyticsInstance();
    const analytics = getAnalyticsInstance('prod');

    await expect(analytics).resolves.toBe('analytics');
    expect(getAnalytics).toHaveBeenCalled();
  });

  it('should not initialize prod analytics if not supported', async () => {
    (isAnalyticsSupported as jest.Mock).mockResolvedValueOnce(false);
    (getAnalytics as jest.Mock).mockResolvedValueOnce('analytics');

    // process.env.NODE_ENV = 'production';
    // const analytics = getAnalyticsInstance();
    const analytics = getAnalyticsInstance('prod');

    await expect(analytics).resolves.toBeUndefined();
    expect(getAnalytics).not.toHaveBeenCalled();
  });

  it('should not initialize analytics in non-prod', async () => {
    (isAnalyticsSupported as jest.Mock).mockResolvedValueOnce(false);
    (getAnalytics as jest.Mock).mockResolvedValueOnce('analytics');

    // process.env.NODE_ENV = 'development';
    // const analytics = getAnalyticsInstance();
    const analytics = getAnalyticsInstance('dev');

    await expect(analytics).resolves.toBeUndefined();
    expect(getAnalytics).not.toHaveBeenCalled();
    getAnalyticsInstance();
  });
});
