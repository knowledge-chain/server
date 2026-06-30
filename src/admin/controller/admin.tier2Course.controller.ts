import { Request, Response, NextFunction } from "express";
import Tier2CourseModel from "../../database/models/tier2course.model";
import Tier2SectionModel from "../../database/models/tier2Section.model";
import Tier2LessonModel from "../../database/models/tier2Lesson.model";
import { mux } from "../../utils/mux/mux.util";
import { uploadToCloudinary } from "../../utils/cloudinary/cloudinary.stream";
import { FromWhoEnum } from "../../database/interface/tier2Course.interface";

export const addCourseController = async (
    req: Request,
    res: Response,
  ) => {
  try {
    const {title, description, isSubscrible} = req.body;

    console.log("isSubscrible", isSubscrible)

    const file = req.file;

    if (!file) {
        return res
        .status(401)
        .json({ message: "Provide Course image" });
    }

    const uploadResults = await uploadToCloudinary(req.file!)
    const pictureUrl = uploadResults.secure_url

    const newCourse = await Tier2CourseModel.create({
        title,
        description,
        price: 0,
        fromWho: FromWhoEnum.Admin,
        picture: pictureUrl,
        subscribeCourse: isSubscrible
    })
  
    res.json({
      message: "Course added sucessfully",
      data: newCourse
    });
    
  } catch (err: any) {
    // signup error
    console.log("err", err)
    res.status(500).json({ message: err.message });
  }
  
}

export const addSectionController = async (
    req: Request,
    res: Response,
  ) => {
  try {
    const {title, course} = req.body;

    const checkCourse = await Tier2CourseModel.findOne({_id: course})
    if (!checkCourse) {
        return res
            .status(401)
            .json({ message: "Course not found" });
    }

    // 2. get last section order
    const lastSection = await Tier2SectionModel.findOne({ course })
      .sort({ order: -1 })
      .lean();

    const nextOrder = lastSection?.order ? lastSection.order + 1 : 1;

    const newSection = await Tier2SectionModel.create({
        course: checkCourse._id,
        title,
        order: nextOrder
    })
  
    res.json({
      message: "Section added sucessfully",
      data: newSection
    });
    
  } catch (err: any) {
    // signup error
    console.log("err", err)
    res.status(500).json({ message: err.message });
  }
  
}



export const addLessonController = async (
    req: Request,
    res: Response,
  ) => {
  try {
    const {title, course, section, wordContent, duration, videoUrl: providedVideoUrl,} = req.body;

    const file = req.file;

    // 👇 require either file or video url
    if (!file && !providedVideoUrl) {
      return res.status(401).json({
        message: "Provide lesson video file or video URL",
      });
    }

    const checkCourse = await Tier2CourseModel.findOne({_id: course})
    if (!checkCourse) {
        return res
            .status(401)
            .json({ message: "Course not found" });
    }

     const checkSection = await Tier2SectionModel.findOne({_id: section, course: checkCourse._id})
    if (!checkSection) {
        return res
            .status(401)
            .json({ message: "Course section not found" });
    }

    // 3. get lesson order inside section
    const lastLesson = await Tier2LessonModel.findOne({
      section: section,
    }).sort({ order: -1 });

    const nextOrder = lastLesson?.order
      ? lastLesson.order + 1
      : 1;

    let videoUrl = "";


     // =====================================
    // FILE UPLOAD
    // =====================================
    if (file) {
      const uploadResults = await uploadToCloudinary(file);
      videoUrl = uploadResults.secure_url;
    }

    // =====================================
    // VIDEO URL
    // =====================================
    if (providedVideoUrl) {
      videoUrl = providedVideoUrl;
    }

    // const asset = await mux.video.assets.create({
    //     inputs: [
    //         {
    //         url: videoUrl,
    //         },
    //     ],
    //     playback_policy: ['public'],
    // });

    // console.log("asset", asset)

    const lesson = await Tier2LessonModel.create({
        course: checkCourse._id,
        section: checkSection._id,
        title,
        wordContent,
        duration: Number(duration || 0),
        order: nextOrder,
        videoUrl,
        // muxAssetId: asset.id,
        // muxPlaybackId: asset.playback_ids?.[0].id,
        muxAssetId: "muxAssetId",
        muxPlaybackId: "muxPlaybackId",
    });

    // update counters (optional but recommended)
    await Tier2SectionModel.findByIdAndUpdate(section, {
      $inc: { totalLessons: 1 },
    });

    await Tier2CourseModel.findByIdAndUpdate(course, {
      $inc: { totalLessons: 1 },
      totalDuration: Number(duration || 0),
    });
  
    res.json({
      message: "Lesson Added  sucessfully",
      data: lesson
    });
    
  } catch (err: any) {
    // signup error
    console.log("err", err)
    res.status(500).json({ message: err.message });
  }
  
}


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

export const getSingleSectionController = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    // 1. Get course
    const section = await Tier2SectionModel.findById(sectionId).lean();

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    return res.status(200).json(section);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching course",
      error: error.message,
    });
  }
};

export const getSingleLessonController = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;

    // 1. Get course
    const lesson = await Tier2LessonModel.findById(lessonId)
    .populate({
      path: 'section',
    })
    .populate({
      path: 'course',
    })
    .lean();

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    return res.status(200).json(lesson);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching course",
      error: error.message,
    });
  }
};


export const updateCourseController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { courseId } = req.params

    const { title, description, isSubscrible } = req.body

    const file = req.file

    // 1. find course
    const course = await Tier2CourseModel.findById(courseId)

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      })
    }

    // 2. update image ONLY if new file exists
    let pictureUrl = course.picture

    if (file) {
      const uploadResults = await uploadToCloudinary(file)
      pictureUrl = uploadResults.secure_url
    }

    // 3. update only provided fields (optional update pattern)
    if (title !== undefined) {
      course.title = title
    }

    if (description !== undefined) {
      course.description = description
    }

    if (isSubscrible !== undefined) {
      course.subscribeCourse = isSubscrible
    }

    course.picture = pictureUrl

    // 4. save
    await course.save()

    return res.status(200).json({
      message: "Course updated successfully",
      data: course,
    })
  } catch (err: any) {
    console.log("err", err)

    return res.status(500).json({
      message: err.message,
    })
  }
}

export const updateSectionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { sectionId } = req.params

    const { title } = req.body

    // 1. find section
    const section = await Tier2SectionModel.findById(sectionId)

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      })
    }

    // 3. update title only if provided
    if (title !== undefined) {
      section.title = title
    }

    // 4. save
    await section.save()

    return res.status(200).json({
      message: "Section updated successfully",
      data: section,
    })
  } catch (err: any) {
    console.log("err", err)

    return res.status(500).json({
      message: err.message,
    })
  }
}


export const updateLessonController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { lessonId } = req.params

    const {
      title,
      wordContent,
      duration,
      videoUrl: providedVideoUrl,
    } = req.body

    const file = req.file

    // 1. find lesson
    const lesson = await Tier2LessonModel.findById(lessonId)

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      })
    }

    // 4. handle video update (file OR url OR keep old)
    let videoUrl = lesson.videoUrl

    if (file) {
      const uploadResults = await uploadToCloudinary(file)
      videoUrl = uploadResults.secure_url
    }

    if (providedVideoUrl) {
      videoUrl = providedVideoUrl
    }

    lesson.videoUrl = videoUrl

    // 5. optional fields update
    if (title !== undefined) {
      lesson.title = title
    }

    if (wordContent !== undefined) {
      lesson.wordContent = wordContent
    }

    if (duration !== undefined) {
      lesson.duration = Number(duration)
    }

    // 6. save
    await lesson.save()

    return res.status(200).json({
      message: "Lesson updated successfully",
      data: lesson,
    })
  } catch (err: any) {
    console.log("err", err)

    return res.status(500).json({
      message: err.message,
    })
  }
}

export const AdminTier2Course = {
    addCourseController,
    addSectionController,
    addLessonController,
    fetchCoureseController,
    getSingleCourseController,
    getSingleLessonController,
    updateCourseController,
    updateSectionController,
    updateLessonController,
    getSingleSectionController
}