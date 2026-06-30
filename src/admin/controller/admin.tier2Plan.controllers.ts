import { Request, Response, NextFunction } from "express";
import Tier2PlanModel from "../../database/models/tier2Plan.model";
import { Tier2PlanStatus } from "../../database/interface/tier2Plan.interface";

export const createTier2PlanController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      name,
      monthlyPrice,
      discription,
    } = req.body;

    const checkPlan = await Tier2PlanModel.findOne({
      name: name.trim(),
    });

    if (checkPlan) {
      return res.status(400).json({
        message: "Plan already exists",
      });
    }

    const plan = await Tier2PlanModel.create({
      name: name.trim(),
      monthlyPrice: Number(monthlyPrice || 0),
      discription,
      status: Tier2PlanStatus.Pending,
    });

    return res.status(201).json({
      message: "Plan created successfully",
      data: plan,
    });
  } catch (err: any) {
    console.log("err", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};


export const editTier2PlanController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { planId } = req.params;

    const {
      name,
      monthlyPrice,
      discription,
      status,
    } = req.body;

    const checkPlan = await Tier2PlanModel.findById(planId);

    if (!checkPlan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    if (
      name &&
      name.trim().toLowerCase() !==
        checkPlan.name.toLowerCase()
    ) {
      const existingPlan = await Tier2PlanModel.findOne({
        name: name.trim(),
        _id: { $ne: planId },
      });

      if (existingPlan) {
        return res.status(400).json({
          message: "Plan name already exists",
        });
      }
    }

    const updatedPlan =
      await Tier2PlanModel.findByIdAndUpdate(
        planId,
        {
          ...(name && { name: name.trim() }),
          ...(monthlyPrice !== undefined && {
            monthlyPrice: Number(monthlyPrice),
          }),
          ...(discription && { discription }),
          ...(status && { status }),
        },
        {
          new: true,
        },
      );

    return res.status(200).json({
      message: "Plan updated successfully",
      data: updatedPlan,
    });
  } catch (err: any) {
    console.log("err", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

export const fetchTier2PlansController = async (
  req: Request,
  res: Response,
) => {
  try {
    const page =
      parseInt(req.query.page as string) || 1;

    const limit =
      parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const search =
      (req.query.search as string) || "";

    const status =
      (req.query.status as string) || "";

    const filter: any = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) {
      filter.status = status;
    }

    const plans = await Tier2PlanModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total =
      await Tier2PlanModel.countDocuments(filter);

    return res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: plans,
    });
  } catch (err: any) {
    console.log("err", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getSingleTier2PlanController =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const { planId } = req.params;

      const plan =
        await Tier2PlanModel.findById(planId);

      if (!plan) {
        return res.status(404).json({
          message: "Plan not found",
        });
      }

      return res.status(200).json({
        data: plan,
      });
    } catch (err: any) {
      console.log(err);

      return res.status(500).json({
        message: err.message,
      });
    }
};

export const tier2PlanController = {
    createTier2PlanController,
    editTier2PlanController,
    fetchTier2PlansController,
    getSingleTier2PlanController
}