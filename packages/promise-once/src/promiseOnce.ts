const promises = new Map<string, Promise<unknown>>();

export function promiseOnce<T>(key: string, callback: () => Promise<T>): Promise<T> {
  if (promises.has(key)) {
    return promises.get(key) as Promise<T>;
  }

  try {
    const promise = callback();
    promises.set(key, promise);

    promise.finally(() => {
      promises.delete(key);
    });

    return promise;
  } catch (err) {
    // Em caso de erro síncrono, garantir que a chave não fique presa
    promises.delete(key);
    throw err;
  }
}
