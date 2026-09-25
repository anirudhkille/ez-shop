import { asyncHandler } from "@/utils/asyncHandler";
import { sendResponse } from "@/utils/response";
import { Request, Response } from "express";
import * as addressService from "@/modules/address/address.service";

export const postAddress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.user!;
  const address = await addressService.createAddress(id, req.body);

  return sendResponse(res, 201, "Address created successfully", address);
});

export const getAddressByUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.user!;
    const address = await addressService.getAddressByUser(id);

    return sendResponse(res, 200, "Address fetched successfully", address);
  },
);

export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const address = await addressService.updateAddress(
      req.params.id,
      req.user!._id,
      req.body,
    );

    if (!address) {
      return sendResponse(res, 404, "Address not found", {
        code: "ADDRESS_NOT_FOUND",
      });
    }

    return sendResponse(res, 200, "Address updated successfully", address);
  },
);

export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const address = await addressService.deleteAddress(
      req.params.id,
      req.user!._id,
    );

    if (!address) {
      return sendResponse(res, 404, "Address not found", {
        code: "ADDRESS_NOT_FOUND",
      });
    }

    return sendResponse(res, 200, "Address deleted successfully", address);
  },
);
