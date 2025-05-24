import * as dotenv from 'dotenv';
dotenv.config();
import { argv } from 'node:process';
import { getArgument } from './shared/functions/get-argument';
import { P2PExchanges } from './shared/types';
import { BybitP2PParser } from './parsers/bybit';
import { BitGetP2PParser } from './parsers/bitget';
import { CronJob } from 'cron';
import { Transformer } from 'transform/index';
import { startServer } from 'app/server';

const getMode = () => getArgument(argv, 'mode') as P2PExchanges;

async function runParser() {
  const mode = getMode().toUpperCase();

  switch (mode) {
    case P2PExchanges.BYBIT:
      await new BybitP2PParser().run();
      break;
    case P2PExchanges.HTX:
      await new BitGetP2PParser().run();
      break;
    case P2PExchanges.TRANSFORM:
      await new Transformer().run();
      break;
    case P2PExchanges.APP:
      await startServer()
      break;
    default:
      console.error('Unknown mode');
      process.exit(1);
  }
}


// const job = new CronJob('*/7 * * * *', async () => {
//   console.log(`[${new Date().toISOString()}] Running parser...`);
//   try {
//     await runParser();
//   } catch (e) {
//     console.error('Error running parser:', e);
//   }
// });

// job.start();

runParser().catch((e) => {
  console.error(e);
  process.exit(1);
});