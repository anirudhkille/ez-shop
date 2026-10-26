import { Request, Response } from "express";
import { asyncHandler } from "@/utils/async-handler";
import { param } from "@/utils/params";
import { sendResponse } from "@/utils/response";
import * as mapboxService from "@/modules/mapbox/mapbox.service";

export const getSuggestions = asyncHandler(
  async (req: Request, res: Response) => {
    const { q, sessionToken } = req.query as {
      q: string;
      sessionToken: string;
    };
    const suggestions = await mapboxService.suggestAddresses(q, sessionToken);

    return sendResponse(
      res,
      200,
      "Address suggestions fetched successfully",
      suggestions,
    );
  },
);

export const getAddressDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionToken } = req.query as { sessionToken: string };
    const address = await mapboxService.retrieveAddress(
      param(req.params.mapboxId),
      sessionToken,
    );

    return sendResponse(res, 200, "Address resolved successfully", address);
  },
);
