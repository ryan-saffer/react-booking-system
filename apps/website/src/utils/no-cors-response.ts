const isOpaqueResponse = (response: Response) => {
  return response.type === "opaque" || response.type === "opaqueredirect";
};

const assertNoCorsRequestSucceeded = (response: Response) => {
  if (!isOpaqueResponse(response) && !response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
};

export { assertNoCorsRequestSucceeded };
