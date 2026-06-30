import { Request, Response } from "express";
import Tier2CourseModel from "../../database/models/tier2course.model";
import Tier2SectionModel from "../../database/models/tier2Section.model";
import Tier2LessonModel from "../../database/models/tier2Lesson.model";
import Tier2UserCourseProgressModel from "../../database/models/tier2CourseProgress.model";
import TierCertificateModel from "../../database/models/tier2certificate.model";
import mongoose, { Types } from "mongoose";
import { completeLesson, mintCertificate } from "../../BlockChain/certificate";
import { generateCertificatePdf, uploadMetadataToIPFS, uploadPdfToIPFS } from "../../utils/generateCerticatePdf.util";
import fs from "fs";
import { checkTierAccess } from "../../BlockChain/contractFunctions";

export const fetchMyTier2CoureseController = async (
    req: Request,
    res: Response,
  ) => {
  try {
    const user = req.user;

    const checkTier2Access = await checkTierAccess(user?.walletAddress!, 2)

    if (!checkTier2Access.checkAccess) {
      return res.status(400).json({
        success: false,
        message: "Please Mint tier 2 NFT",
      });
    }

    // 📌 pagination params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    // 📌 search keyword
    const search = (req.query.search as string) || "";

    // 📌 build filter
    let filter: any = {};

    if (user?.tier2SubscriptionExpired || !user?.subscribeToTier2) {
       filter.subscribeCourse = false
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i", // case-insensitive
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // 📌 fetch courses
    const courses = await Tier2CourseModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // 📌 total count for pagination
    const total = await Tier2CourseModel.countDocuments(filter);

    return res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: courses,
    });
    
  } catch (err: any) {
    // signup error
    console.log("err", err)
    res.status(500).json({ message: err.message });
  }
  
}



export const getMyTier2SingleCourseForUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;

    const userId = req.user?._id;


    // ------------------------------------------------
    // COURSE
    // ------------------------------------------------
    const course = await Tier2CourseModel.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // ------------------------------------------------
    // SECTIONS
    // ------------------------------------------------
    const sections = await Tier2SectionModel.find({
      course: courseId,
    })
      .sort({ order: 1 })
      .lean();

    // ------------------------------------------------
    // LESSONS
    // ------------------------------------------------
    const lessons = await Tier2LessonModel.find({
      course: courseId,
    })
      .sort({ order: 1 })
      .lean();

    // ------------------------------------------------
    // USER PROGRESS
    // ------------------------------------------------
    let progress = await Tier2UserCourseProgressModel.findOne({
      user: userId,
      course: courseId,
    });

    // ------------------------------------------------
    // FIRST TIME USER
    // ------------------------------------------------
    if (!progress) {
      progress = await Tier2UserCourseProgressModel.create({
        user: userId,
        course: courseId,
        completedLessons: [],
        completedSections: [],
        currentLesson:
          lessons.length > 0 ? lessons[0]._id : null,
        progressPercentage: 0,
        completedCourse: false,
      });
    }

    // ------------------------------------------------
    // COMPLETED LESSON IDS
    // ------------------------------------------------
    const completedLessonIds =
      progress.completedLessons.map((id) =>
        id.toString()
      );

    // -------------------------------------
    // COMPLETED LESSONS
    // -------------------------------------
    const completedLessons = lessons.filter((lesson) =>
    completedLessonIds.includes(
        lesson._id.toString()
    )
    );

    // -------------------------------------
    // NOT COMPLETED LESSONS
    // -------------------------------------
    const notCompletedLessons = lessons.filter(
    (lesson) =>
        !completedLessonIds.includes(
        lesson._id.toString()
        )
    );

    // ------------------------------------------------
    // ADD LOCK STATUS
    // ------------------------------------------------
    const lessonsWithStatus = lessons.map(
      (lesson, index) => {
        const completed =
          completedLessonIds.includes(
            lesson._id.toString()
          );

        let locked = false;

        // First lesson always unlocked
        if (index > 0) {
          const previousLesson = lessons[index - 1];

          locked =
            !completedLessonIds.includes(
              previousLesson._id.toString()
            );
        }

        return {
          ...lesson,
          completed,
          locked,
        };
      }
    );

    // ------------------------------------------------
    // ATTACH LESSONS TO SECTION
    // ------------------------------------------------
    const sectionsWithLessons = sections.map(
      (section) => {
        const sectionLessons =
          lessonsWithStatus.filter(
            (lesson) =>
              lesson.section.toString() ===
              section._id.toString()
          );

        return {
          ...section,
          lessons: sectionLessons,
        };
      }
    );

    // ------------------------------------------------
    // RESPONSE
    // ------------------------------------------------
    return res.status(200).json({
      success: true,
      course: {
        ...course,
        sections: sectionsWithLessons,
      },
      progress: {
        currentLesson: progress.currentLesson,
        completedLessons:
          progress.completedLessons,
        progressPercentage:
          progress.progressPercentage,
        completedCourse:
          progress.completedCourse,
      },
      // all lessons
      allLessons: lessons,

      // lessons already completed
      completedLessons,

      // lessons not yet completed
      notCompletedLessons,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching course",
      error: error.message,
    });
  }
};


export const getCompletedLessonsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;

    const progress = await Tier2UserCourseProgressModel.findOne({
      user: userId,
      course: courseId,
    }).populate("completedLessons");

    if (!progress) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: progress.completedLessons,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNotCompletedLessonsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;

    const progress = await Tier2UserCourseProgressModel.findOne({
      user: userId,
      course: courseId,
    });

    const lessons = await Tier2LessonModel.find({ course: courseId }).sort({
      order: 1,
    });

    const completedIds =
      progress?.completedLessons?.map((id) => id.toString()) || [];

    const notCompleted = lessons.filter(
      (lesson) => !completedIds.includes(lesson._id.toString())
    );

    return res.status(200).json({
      success: true,
      data: notCompleted,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const completeLessonController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId, lessonId } = req.body;
    const userId = req.user?._id;
    const user = req.user

    const checkLesson = await Tier2LessonModel.findOne({_id: lessonId, course: courseId})

    if (!checkLesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    let progress = await Tier2UserCourseProgressModel.findOne({
      user: userId,
      course: courseId,
    });

    if (!progress) {
      progress = await Tier2UserCourseProgressModel.create({
        user: userId,
        course: courseId,
        completedLessons: [],
        completedSections: [],
        progressPercentage: 0,
        completedCourse: false,
      });
    }

    // avoid duplicate
    const alreadyDone = progress.completedLessons.some(
      (id) => id.toString() === lessonId
    );

    if (!alreadyDone) {
      progress.completedLessons.push(lessonId as any);
    }

    // get all lessons for ordering
    // const lessons = await LessonModel.find({ course: courseId }).sort({
    //   order: 1,
    // });

    const lessons = await Tier2LessonModel.find({ course: courseId }).sort({
      createdAt: 1,
    });

    const index = lessons.findIndex(
      (l) => l._id.toString() === lessonId
    );

    const nextLesson = lessons[index + 1];

    // unlock next lesson
    if (nextLesson) {
      progress.currentLesson = nextLesson._id as any;
    }else{
      progress.currentLesson = undefined;
    }

    // progress calculation
    const total = lessons.length;
    const completed = progress.completedLessons.length;

    progress.progressPercentage = Math.round(
      (completed / total) * 100
    );

    if (completed === total) {
      progress.completedCourse = true;
    }

    // -----------------------------------
    // SAVE BLOCKCHAIN RECORD
    // -----------------------------------
    const chainCompleteLesson = await completeLesson(user?.walletAddress!, courseId, lessonId);
    if (!chainCompleteLesson.status) {
      return res.status(401).json({
        success: false,
        message: chainCompleteLesson.message 
      });
    }

    const hash = chainCompleteLesson.hash
    // const hash = "hash"

    progress.blockchainCompletions.push({
      lesson: checkLesson._id as unknown as mongoose.Types.ObjectId,
      txHash: hash,
      completedAt: new Date(),
    });

    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Lesson completed successfully",
      nextLesson: nextLesson || null,
      progress,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getNextLessonController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;

    const progress = await Tier2UserCourseProgressModel.findOne({
      user: userId,
      course: courseId,
    }).populate("currentLesson");

    // const lessons = await LessonModel.find({ course: courseId }).sort({
    //   order: 1,
    // });

    const lessons = await Tier2LessonModel.find({ course: courseId }).sort({
      createdAt: 1,
    });

    if (!progress) {
      return res.status(200).json({
        success: true,
        data: lessons[0] || null,
      });
    }

    // const completedIds =
    //   progress.completedLessons.map((id) => id.toString());

    // const nextLesson = lessons.find(
    //   (lesson) => !completedIds.includes(lesson._id.toString())
    // );

    return res.status(200).json({
      success: true,
      data: progress.currentLesson || null,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const mintCertificateController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?._id;
    const user = req.user

    const course = await Tier2CourseModel.findOne({_id: courseId})
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const checkCertificate = await TierCertificateModel.findOne({user: userId, course: courseId})

    if (checkCertificate) {
      return res.status(403).json({
        success: false,
        message: "Certificate alreay minted",
      });
    }

    const generateCertificatePdfUtil = await generateCertificatePdf(user?.name? user.name : user?.walletAddress!, course.title)

    const uploadPdfToIPFSUtil  = await  uploadPdfToIPFS(generateCertificatePdfUtil)

    const certificatePdfUrl = uploadPdfToIPFSUtil.url

    fs.unlinkSync( generateCertificatePdfUtil);

    const metadata = {
      name: `${course.title} Certificate`,
      description: course.description,

      external_url: certificatePdfUrl, // IPFS PDF

      attributes: [
        {
          trait_type: "Student",
          value: user?.name,
        },
        {
          trait_type: "Course",
          value: course.title,
        },
        {
          trait_type: "Issued At",
          value: new Date().toISOString(),
        },
      ],
    };

    const uploadMetadataToIPFSUtil = await uploadMetadataToIPFS(metadata)

    const metadatalUrl = uploadMetadataToIPFSUtil.url
    
    const chainCertificate = await mintCertificate(user?.walletAddress!, courseId,  metadatalUrl);
    if (!chainCertificate.status) {
      return res.status(401).json({
        success: false,
        message: chainCertificate.message 
      });
    }

    const certificate =  await TierCertificateModel.create({
      user: userId,
      course: courseId,
      tokenId: chainCertificate.tokenId,
      txHash: chainCertificate.hash,
      metadataUrl: metadatalUrl, 
      certificatePdfUrl: certificatePdfUrl,
      issuedAt: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "Certificate minted successfully",
      certificatePdfUrl: certificatePdfUrl,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getCourseCertificateController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;
    const user = req.user

    const course = await Tier2CourseModel.findOne({_id: courseId})
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const checkCertificate = await TierCertificateModel.findOne({user: userId, course: courseId})

    if (!checkCertificate) {
      return res.status(404).json({
        success: false,
        message: "You don't have certificate for this course",
      });
    }

    return res.status(200).json({
      success: true,
      checkCertificate
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const myTier2Course = {
    fetchMyTier2CoureseController,
    getMyTier2SingleCourseForUserController,

    getCompletedLessonsController,
    getNotCompletedLessonsController,
    completeLessonController,
    getNextLessonController,

    mintCertificateController,
    getCourseCertificateController
}