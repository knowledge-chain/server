import { Request, Response } from "express";
import Tier2CourseModel from "../../database/models/tier2course.model";
import Tier2SectionModel from "../../database/models/tier2Section.model";
import Tier2LessonModel from "../../database/models/tier2Lesson.model";
import Tier2UserCourseProgressModel from "../../database/models/tier2CourseProgress.model";


// (replace with your real blockchain/NFT service)
const verifyTier2NFT = async (walletAddress: string) => {
  // MOCK LOGIC (replace with contract call later)
  // return true if user owns Tier 2 NFT
  return walletAddress?.startsWith("0x"); 
};

export const accessCheckController = async (
  req: Request,
  res: Response
) => {
  try {
    // const userId = (req as any).user?.id;
    const { courseId } = req.params;

    // // 1. Get user
    // const user = await UserModel.findById(userId);

    // if (!user) {
    //   return res.status(404).json({
    //     hasAccess: false,
    //     reason: "User not found",
    //   });
    // }

    // 2. Get course
    const course = await Tier2CourseModel.findById(courseId);

    if (!course) {
      return res.status(404).json({
        hasAccess: false,
        reason: "Course not found",
      });
    }

    // // 3. NFT CHECK (Tier 2 gate)
    // const hasNFT = await verifyTier2NFT(user.walletAddress);

    // if (!hasNFT) {
    //   return res.status(403).json({
    //     hasAccess: false,
    //     reason: "Tier 2 NFT required to access this course",
    //   });
    // }

    // 4. Optional: check if user already has progress record
    // (you can create it here automatically later)
    
    return res.status(200).json({
      hasAccess: true,
      reason: "Access granted",
      course: {
        _id: course._id,
        title: course.title,
        picture: course.picture,
      },
    });

  } catch (err: any) {
    console.log("accessCheck error:", err);

    return res.status(500).json({
      hasAccess: false,
      reason: err.message || "Internal server error",
    });
  }
};


// GET ALL COURSES
export const getAllCoursesController = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const courses = await Tier2CourseModel.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Tier2CourseModel.countDocuments();

    return res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: courses,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// GET SINGLE COURSE
export const getSingleCourseController = async (req: any, res: any) => {
  try {
    const { courseId } = req.params;

    const course = await Tier2CourseModel.findById(courseId)
      .populate({
        path: "sections",
        populate: {
          path: "lessons",
        },
      })
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json(course);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// GET SINGLE LESSON
export const getSingleLessonController = async (req: any, res: any) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Tier2LessonModel.findById(lessonId)
      .populate("course")
      .populate("section")
      .lean();

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    return res.status(200).json(lesson);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


// LESSON ACCESS CHECK
export const lessonAccessController = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.params;

    const lesson = await Tier2LessonModel.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        unlocked: false,
        reason: "Lesson not found",
      });
    }

    const progress = await Tier2UserCourseProgressModel.findOne({
      user: userId,
      course: lesson.course,
    });

    // first lesson always unlocked
    if (!progress) {
      return res.status(200).json({
        unlocked: true,
        reason: "First access",
      });
    }

    const isCompleted = progress.completedLessons.includes(lesson._id as any);

    if (isCompleted) {
      return res.status(200).json({
        unlocked: true,
        reason: "Already completed",
      });
    }

    const index = progress.completedLessons.length;

    return res.status(200).json({
      unlocked: true,
      reason: "Next lesson unlocked",
      nextIndex: index,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


// COMPLETE LESSON (BLOCKCHAIN VERIFIED)
export const completeLessonController = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { lessonId, txHash } = req.body;

    const lesson = await Tier2LessonModel.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    let progress = await Tier2UserCourseProgressModel.findOne({
      user: userId,
      course: lesson.course,
    });

    if (!progress) {
      progress = await Tier2UserCourseProgressModel.create({
        user: userId,
        course: lesson.course,
        completedLessons: [],
        blockchainCompletions: [],
      });
    }

    // prevent duplicate completion
    if (progress.completedLessons.includes(lessonId)) {
      return res.status(400).json({ message: "Already completed" });
    }

    progress.completedLessons.push(lessonId);

    progress.blockchainCompletions.push({
      lesson: lessonId,
      txHash,
      completedAt: new Date(),
    });

    // unlock next lesson logic (simple version)
    const total = await Tier2LessonModel.countDocuments({ course: lesson.course });

    progress.progressPercentage =
      (progress.completedLessons.length / total) * 100;

    if (progress.completedLessons.length === total) {
      progress.completedCourse = true;
    }

    await progress.save();

    return res.status(200).json({
      message: "Lesson completed",
      progress,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// COURSE PROGRESS
export const progressController = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const totalLessons = await Tier2LessonModel.countDocuments({
      course: courseId,
    });

    const progress = await Tier2UserCourseProgressModel.findOne({
      user: userId,
      course: courseId,
    });

    const completed = progress?.completedLessons.length || 0;

    const percentage =
      totalLessons === 0 ? 0 : (completed / totalLessons) * 100;

    return res.status(200).json({
      completedLessons: completed,
      totalLessons,
      percentage,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


// CONTINUE LEARNING
export const continueController = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const progress = await Tier2UserCourseProgressModel.findOne({
      user: userId,
      course: courseId,
    });

    const completedLessons = progress?.completedLessons || [];

    const nextLesson = await Tier2LessonModel.findOne({
      course: courseId,
      _id: { $nin: completedLessons },
    }).sort({ createdAt: 1 });

    if (!nextLesson) {
      return res.status(200).json({
        message: "Course completed",
        nextLesson: null,
      });
    }

    return res.status(200).json({
      nextLesson,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


export const UserCoursesDetail = {
    getAllCoursesController
}