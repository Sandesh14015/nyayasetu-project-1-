import { Router, type IRouter } from "express";
import healthRouter from "./health";
import judicialRouter from "./judicial";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(judicialRouter);
router.use(openaiRouter);

export default router;
