import { asyncHandler } from "@/middlewares/asyncHandler";
import Address from "@/models/Address";
import { Request, Response } from "express";

export const postAddress = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.user;
  const address = await Address.create({ ...req.body, user: id });
  address.save();

  return res.status(201).json({
    success: true,
    message: "Address created successfully",
    data: address,
  });
});

export const getAddressByUser = asyncHandler(
  async (req: any, res: Response) => {
    const { id } = req.user;
    const address = await Address.find({ user: id });

    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      data: address,
    });
  }
);

export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const address = await Address.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    if (!address)
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  }
);

export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const address = await Address.findByIdAndDelete(req.params.id);

    if (!address)
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: address,
    });
  }
);
