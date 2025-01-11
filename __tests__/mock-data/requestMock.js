import { serverStatusResponseMock } from "./responseMock";

export const request = {
  get: () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.5) {
          resolve(serverStatusResponseMock);
        } else {
          reject(new Error('test error'));
        }
      }, Math.random() * (7000 - 1000 + 1) + 1000);
    }),
};
