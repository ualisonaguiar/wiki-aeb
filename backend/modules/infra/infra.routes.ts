import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import * as controller from './infra.controller.js';

const router = Router();

router.get('/health', asyncHandler(controller.healthCheck));

router.get('/aplicacoes', asyncHandler(controller.listAplicacoes));
router.get('/aplicacoes/:id', asyncHandler(controller.getAplicacao));
router.post('/aplicacoes', asyncHandler(controller.createAplicacao));
router.put('/aplicacoes/:id', asyncHandler(controller.updateAplicacao));
router.delete('/aplicacoes/:id', asyncHandler(controller.deleteAplicacao));

router.post('/aplicacoes/:id/hosts', asyncHandler(controller.addHost));
router.delete('/aplicacoes/:id/hosts/:hostId', asyncHandler(controller.removeHost));

router.post('/aplicacoes/:id/unidades', asyncHandler(controller.addUnidade));
router.delete('/aplicacoes/:id/unidades/:vinculoId', asyncHandler(controller.removeUnidade));

router.get('/status', asyncHandler(controller.listStatus));
router.get('/unidades', asyncHandler(controller.listUnidades));
router.get('/vhosts', asyncHandler(controller.listVhostInformacoes));

export default router;
