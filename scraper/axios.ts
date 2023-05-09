import { AxiosInstance } from 'axios';

export function summarizeResponses(client: AxiosInstance) {
  client.interceptors.response.use(
    (response) => {
      hideUnwantedProperties(response);
      return response;
    },
    (error) => {
      hideUnwantedProperties(error);
      hideUnwantedProperties(error.response);
      error.toJSON = undefined;
      throw error;
    },
  );
}

function hideUnwantedProperties(res: any) {
  if (!res) {
    return;
  }

  if (res.request) {
    Object.defineProperty(res, 'request', { enumerable: false });
  }

  if (res.config) {
    const wantedKeys = ['method', 'url', 'headers', 'data'];
    const configKeys = Object.keys(res.config).filter(
      (it) => !wantedKeys.includes(it),
    );

    for (const key of configKeys) {
      Object.defineProperty(res.config, key, { enumerable: false });
    }
  }
}
