const warnedMessages = new Set();

export function warnOnce(location: string, message: string): void {
  const mergedMessage = `[mssaq-ui/${location}]: ${message}`;
  if (warnedMessages.has(mergedMessage)) return;
  warnedMessages.add(mergedMessage);
  console.error(mergedMessage);
}

export function warn(location: string, message: string): void {
  console.error(`[mssaq-ui/${location}]: ${message}`);
}

export function throwError(location: string, message: string): never {
  throw new Error(`[mssaq-ui/${location}]: ${message}`);
}
