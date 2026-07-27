

const state = { verbose: false };

export const logger = {
  setVerbose: (enabled: boolean) => {
    state.verbose = enabled;
  },
  log: (...args: any[]) => {
    if (state.verbose) console.log(...args);
  },
  info: (...args: any[]) => {
    if (state.verbose) console.info(...args);
  },
  warn: (...args: any[]) => {
    if (state.verbose) console.warn(...args);
  },
  error: (...args: any[]) => {
    
    console.error(...args);
  },
};
