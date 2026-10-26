import express from "express";
import { mapboxLimiter } from "@/config/limiter";
import { validate } from "@/middlewares/validate.middleware";
import {
  getAddressDetails,
  getSuggestions,
} from "@/modules/mapbox/mapbox.controller";
import {
  mapboxRetrieveParamsSchema,
  mapboxRetrieveQuerySchema,
  mapboxSuggestQuerySchema,
} from "@/modules/mapbox/mapbox.schema";

const router = express.Router();

router.get(
  "/suggest",
  mapboxLimiter,
  validate(mapboxSuggestQuerySchema, "query"),
  getSuggestions,
);

router.get(
  "/retrieve/:mapboxId",
  mapboxLimiter,
  validate(mapboxRetrieveParamsSchema, "params"),
  validate(mapboxRetrieveQuerySchema, "query"),
  getAddressDetails,
);

export default router;
