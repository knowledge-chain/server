import { Request, Response } from "express";
import Tier2CourseModel from "../../database/models/tier2course.model";
import Tier2SectionModel from "../../database/models/tier2Section.model";
import Tier2LessonModel from "../../database/models/tier2Lesson.model";

export const fetchCoureseController = async (
    req: Request,
    res: Response,
  ) => {
  try {
    // 📌 pagination params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    // 📌 search keyword
    const search = (req.query.search as string) || "";

    // 📌 build filter
    const filter: any = {};

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

export const getSingleCourseController = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    // 1. Get course
    const course = await Tier2CourseModel.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // 2. Get all sections for this course
    const sections = await Tier2SectionModel.find({
      course: courseId,
    }).lean();

    const sectionIds = sections.map((s) => s._id);

    // 3. Get all lessons for those sections
    const lessons = await Tier2LessonModel.find({
      section: { $in: sectionIds },
    }).lean();

    // 4. Attach lessons to sections
    const sectionsWithLessons = sections.map((section) => {
      const sectionLessons = lessons.filter(
        (lesson) =>
          lesson.section.toString() === section._id.toString()
      );

      return {
        ...section,
        lessons: sectionLessons,
      };
    });

    // 5. Attach sections to course
    const result = {
      ...course,
      sections: sectionsWithLessons,
    };

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching course",
      error: error.message,
    });
  }
};

export const UserCourse = {
    fetchCoureseController,
    getSingleCourseController
}