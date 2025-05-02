import { LibrariesEnum } from '../../@types';

export const routeUtilsTemplate = (apiLib: LibrariesEnum) => {
  switch (apiLib) {
    case LibrariesEnum.apollo_server:
      return `// apollo server utils`;
    case LibrariesEnum.express:
      return expressUtilsTemplate;
    case LibrariesEnum.nestjs:
      return `// nestjs utils`;
  }
};

const expressUtilsTemplate = `
import {
  Request,
  Response,
  NextFunction,
} from 'express';
function promisifyMiddleware(middleware: any) {
  return (req: Request, res: Response) => {
    return new Promise<void>((resolve, reject) => {
      middleware(req, res, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };
}

export const middlewareOrchestrator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO wire up middleware here
    next();
  } catch (error) {
    next(error);
  }
};

`;
