import { initRelay } from '@roll20-official/beacon-sdk';
import { relayConfig } from './relay/relay';

const main = async () => {
  await initRelay(relayConfig);
};

main();
