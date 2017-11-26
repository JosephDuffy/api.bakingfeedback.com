import { Inject, Service } from 'typedi';
import winston = require('winston');

import Database from './Database';
import Server from './Server';

@Service()
export default class Core {

  @Inject()
  private database: Database;

  @Inject()
  private server: Server;

  public async start() {
    winston.info('Baking Feedback API core starting');

    await this.database.initialise();

    await this.server.start();
  }

}
