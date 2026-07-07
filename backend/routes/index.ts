import { Router } from "express";

import authRouter from "../modules/auth/auth.routes.js";
import adminRouter from "../modules/admin/admin.routes.js";
import docsRouter from "./docs.js";
import healthRouter from "./health.js";
import gitlabRouter from "../modules/gitlab/gitlab.routes.js";
import infraRouter from "../modules/infra/infra.routes.js";
import inventarioVmRouter from "../modules/infra/inventario.vm.routes.js";
import nutanixRouter from "../modules/nutanix/nutanix.routes.js";
import prometheusRouter from "../modules/prometheus/prometheus.routes.js";
import projetobRouter from "../modules/projeto/projeto.routes.js";
import { authenticateToken } from "../shared/http/auth.middleware.js";

const router = Router();

router.use("/", docsRouter);
router.use("/docs", docsRouter);

router.use("/admin", (req, res, next) => {
  const path = req.path || "/";
  const shouldSkipAuth = path === "/login" || path.startsWith("/token");

  if (shouldSkipAuth) {
    next();
    return;
  }

  authenticateToken(req, res, next);
});

router.use("/admin", authRouter);
router.use("/admin", adminRouter);
router.use("/health", healthRouter);
router.use("/gitlab", gitlabRouter);
router.use("/projetos", projetobRouter);
router.use("/infra", infraRouter);
router.use("/inventario-vm", inventarioVmRouter);
router.use("/nutanix", nutanixRouter);
router.use("/prometheus", prometheusRouter);

export default router;
