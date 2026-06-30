import Tier2LessonModel from "../../database/models/tier2Lesson.model";
import Tier2UserCourseProgressModel from "../../database/models/tier2CourseProgress.model";

export const checkLessonAccess = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.lessonId;

    const lesson = await Tier2LessonModel.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const progress = await Tier2UserCourseProgressModel.findOne({
      user: userId,
      course: lesson.course,
    });

    // 🚨 FIRST LESSON ALWAYS OPEN
    if (!progress || progress.completedLessons.length === 0) {
      const firstLesson = await Tier2LessonModel.findOne({
        course: lesson.course,
      }).sort({ order: 1 });

      if (firstLesson?._id.toString() !== lessonId) {
        return res.status(403).json({
          message: "Complete previous lesson first",
        });
      }

      return next();
    }

    // 🚨 GET LAST COMPLETED LESSON
    const lastLessonId =
      progress.completedLessons[progress.completedLessons.length - 1];

    const lastLesson = await Tier2LessonModel.findById(lastLessonId);

    if (!lastLesson) {
      return res.status(403).json({
        message: "Progress corrupted",
      });
    }

    // 🚨 STRICT ORDER CHECK
    if (lesson.order !== lastLesson.order + 1) {
      return res.status(403).json({
        message: "You must complete previous lesson first",
      });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// router.get(
//   "/user/lesson/:lessonId",
//   checkUserAuth,
//   checkLessonAccess,
//   getSingleLessonController
// );