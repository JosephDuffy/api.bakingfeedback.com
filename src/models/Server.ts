import * as Koa from 'koa';
import koaLogger = require('koa-logger-winston');
import * as fs from 'mz/fs';
import * as path from 'path';
import { createKoaServer } from 'routing-controllers';
import { Service } from 'typedi';
import winston = require('winston');

@Service()
export default class Server {

  private server: Koa;

  public async start() {
    const controllers = await this.loadControllers();
    this.server = createKoaServer({
        controllers,
        cors: true,
    });

    const listenPort = 13515;

    this.server.use(koaLogger(winston));
    this.server.use(async (ctx, next) => {
      try {
        await next();
      } catch (error) {
        winston.error('Error occurred:', error.message, error.stackTrace);
        throw error;
      }
    });

    this.server.listen(listenPort);

    winston.info(`HTTP server listening at on port ${listenPort}`);
  }

  // tslint:disable:ban-types
  private async loadControllers(): Promise<Function[]> {
    const controllersDirectory = path.join(__dirname, '../controllers');

    const controllerFiles = await fs.readdir(controllersDirectory);

    return controllerFiles
      .filter(filename => filename.endsWith('.ts') && !filename.endsWith('.d.ts') || filename.endsWith('js'))
      .map(filename => {
        const fullPath = path.join(controllersDirectory, filename);
        return require(fullPath).default;
      });
  }

}
