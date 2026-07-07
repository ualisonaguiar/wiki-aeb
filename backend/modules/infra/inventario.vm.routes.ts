import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import * as controller from "./inventario.vm.controller.js";

const router = Router();

router.get("/", asyncHandler(controller.listInventarioVms));
router.get("/:id", asyncHandler(controller.getInventarioVm));
router.post("/", asyncHandler(controller.createInventarioVm));
router.put("/:id", asyncHandler(controller.updateInventarioVm));
router.delete("/:id", asyncHandler(controller.deleteInventarioVm));
router.get("/:vm/aplicacoes", asyncHandler(controller.getAplicacoesByVm));

export default router;
