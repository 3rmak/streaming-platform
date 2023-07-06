import { Router, Request, Response } from "express";

export const RoomRoute = Router();

RoomRoute.post('/create', (req: Request, res: Response)=>{
    return res.send({ message: 'here' })
});