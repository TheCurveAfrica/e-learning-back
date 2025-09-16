import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import baseRoute from './api/routes/Base';
import cors from 'cors';
import { Errors } from './core/constants/errors';
import { handleErrors } from './api/middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan(':date[web] :method :url :status :response-time ms - :res[content-length]'));
app.use(
  cors({
    credentials: true,
    origin: '*'
  })
);

app.use('/api/v1', baseRoute);

app.use((req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).send({
    status: false,
    error: 'not found',
    message: Errors.RESOURCE_NOT_FOUND,
    data: {},
    path: req.url
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    handleErrors(err, req, res, next);
  } else {
    next();
  }
});

export default app;
