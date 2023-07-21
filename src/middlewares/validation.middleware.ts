import { NextFunction, Request, Response } from 'express';
import { validate } from 'class-validator';

export const ValidationMiddleware = <T extends {}>(type: new () => T) => async (req: Request, res: Response, next: NextFunction) => {
  const typeDto: T = Object.assign(new type(), req.body) as T;
  const errors = await validate(typeDto);
  if (errors && errors.length > 0) {
    const errorsMessages = errors.map((e) => e.toString());
    next(errorsMessages);
  }
}
