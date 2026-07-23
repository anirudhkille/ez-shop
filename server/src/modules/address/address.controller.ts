import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import * as addressService from "@/modules/address/address.service";

export const postAddress = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.user;
  const result = await addressService.createAddress(id, req.body);

  return res.status(201).json({
    success: true,
    message: "Address created successfully",
    data: result.address,
  });
});

export const getAddressByUser = asyncHandler(
  async (req: any, res: Response) => {
    const { id } = req.user;
    const result = await addressService.getAddressByUser(id);

    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      data: result.address,
    });
  },
);

export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await addressService.updateAddress(req.params.id, req.body);

    if (!result.address)
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: result.address,
    });
  },
);

export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await addressService.deleteAddress(req.params.id);

    if (!result.address)
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: result.address,
    });
  },
);
