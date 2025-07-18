"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Card, Tabs, Typography, Divider, Rate, Row, Col } from "antd";
import Image from "next/image";
import { PageLoading } from "@/components/PageLoading";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import DeleteCourseButton from "./DeleteButton";
import { useNotification } from "@/components/NotificationContext";
import ErrorPage from "@/components/ErrorPage";
import Link from "next/link";

const { Title, Text, Paragraph } = Typography;

interface ICourse {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  level: string;
  duration: number;
  totalSections: number;
  totalLectures: number;
  totalEnrollment: number;
  educatorName: string;
  isPublished: boolean;
  prerequisites: string;
  learningOutcomes: string;
  educator: {
    _id: string;
  };
}

const CourseDetailPage = () => {
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isCoursePurchased, setIsCoursePurchased] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const { showNotification } = useNotification();

  const { user, fetchUserData } = useUser();
  const params = useParams();
  const router = useRouter();

  const courseId = params.courseId as string;

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/course/${courseId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }

        const data = await response.json();
        setCourse(data.msg);
        console.log(data.msg);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);


  // Check permissions to delete and update page
useEffect(() => {
  // Reset states first
  setIsCoursePurchased(false);
  setIsOwner(false);

  if (user && user.purchaseCourse && Array.isArray(user.purchaseCourse)) {
    const purchased = user.purchaseCourse.some((purchase) => {
      // Check if purchase object exists and has courseId
      if (!purchase || !purchase.courseId) return false;
      
      let purchaseCourseId;
      if (typeof purchase.courseId === "object") {
        // courseId is populated (Course object), get its _id
        purchaseCourseId = purchase.courseId._id;
      } else {
        // courseId is just the ObjectId string
        purchaseCourseId = purchase.courseId;
      }
      
      return purchaseCourseId && purchaseCourseId.toString() === courseId;
    });
    setIsCoursePurchased(purchased);
  }

  // Only check for ownership if user is actually an educator
  if (user && user.courses && Array.isArray(user.courses)) {
    const owned = user.courses.some(
      (course) => {
        // More robust null checking
        if (!course) return false;
        
        const courseIdStr = typeof course === 'object' 
          ? course.toString() 
          : String(course);
        
        return courseIdStr === courseId;
      }
    );
    setIsOwner(owned);
  }

}, [user, courseId]);

  const handleEnroll = async () => {
    try {
      setEnrollLoading(true);

      const res = await fetch("/api/user/purchasecourse", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courses: [courseId],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsCoursePurchased(false);
        showNotification(data.msg, "error");
        return;
      }
      setIsCoursePurchased(true);
      setShowEnrollModal(false);
      fetchUserData();
      showNotification("Enrollment successful!", "success");
    } catch {
      showNotification("There is some error please try again later", "error");
    } finally {
      setEnrollLoading(false);
    }
  };

  // fetching the average review
  const fetchReview = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/user/review/${courseId}/averagerating`
      );
      if (!response.ok) {
        console.log("Failed to submit rating");
      }
      const data = await response.json();
      setAverageRating(data.averageRating || 0);
      setTotalRatings(data.totalRatings || 0);
    } catch {
      console.log("Error in fetching the error");
    }
  }, [courseId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const handleUpdateCourse = () => {
    router.push(`/educator/editcourse/${courseId}`);
  };

  const handleViewChapters = () => {
    router.push(`/course/${courseId}/chapters`);
  };

  const renderLevelTag = (level: string) => {
    const levelMap: Record<string, { color: string; bg: string }> = {
      beginner: {
        color: "text-green-700",
        bg: "bg-green-100 border-green-300",
      },
      intermediate: {
        color: "text-orange-700",
        bg: "bg-orange-100 border-orange-300",
      },
      advanced: { color: "text-red-700", bg: "bg-red-100 border-red-300" },
    };
    const style = levelMap[level.toLowerCase()] || {
      color: "text-blue-700",
      bg: "bg-blue-100 border-blue-300",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold border ${style.bg} ${style.color}`}
      >
        {level}
      </span>
    );
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <ErrorPage error={error}></ErrorPage>;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-200">
          <div className="text-rose-500 text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-rose-800 mb-2">
            Course not found
          </h2>
          <p className="text-rose-600">
            The course you are looking for doesn not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen mb-20">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-pink-600 via-rose-500 to-cherry-600 text-white py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/20 via-rose-800/20 to-cherry-900/20"></div>
          <div className="relative max-w-7xl mx-auto px-6 mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-6">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 mr-2">
                    {course.category}
                  </span>
                  {renderLevelTag(course.level)}
                </div>

                <Title
                  level={1}
                  className="!text-white !text-4xl lg:!text-5xl !font-bold !mb-6 leading-tight"
                >
                  {course.title}
                </Title>

                <div className="flex items-center gap-4 mb-6">
                  <Rate
                    disabled
                    value={averageRating}
                    allowHalf
                    className="text-yellow-400"
                  />
                  <Text className="!text-white text-lg">
                    {averageRating} ({totalRatings} reviews)
                  </Text>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">{course.duration}h</div>
                    <div className="text-white/80 text-sm">Duration</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">
                      {course.totalSections}
                    </div>
                    <div className="text-white/80 text-sm">Sections</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">
                      {course.totalLectures}
                    </div>
                    <div className="text-white/80 text-sm">Lectures</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">
                      {course.totalEnrollment}
                    </div>
                    <div className="text-white/80 text-sm">Students</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                  <Image
                    alt={course.title}
                    src={course.imageUrl}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              {/* Course Content Card */}
              <Card
                className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-300"
                style={{ borderRadius: "24px" }}
              >
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  className="course-tabs"
                  items={[
                    {
                      key: "overview",
                      label: (
                        <span className="flex items-center gap-2 font-semibold text-lg">
                          📋 Overview
                        </span>
                      ),
                      children: (
                        <div className="space-y-8">
                          <div>
                            <Title
                              level={3}
                              className="!text-rose-800 !mb-4 flex items-center gap-2"
                            >
                              📖 About This Course
                            </Title>
                            <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
                              <Paragraph className="!text-gray-700 !text-lg !leading-relaxed !mb-0">
                                {course.description}
                              </Paragraph>
                            </div>
                          </div>

                          <Divider className="!border-pink-200" />

                          <div>
                            <Title
                              level={3}
                              className="!text-rose-800 !mb-4 flex items-center gap-2"
                            >
                              ✅ Prerequisites
                            </Title>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                              {course?.prerequisites?.split(".").map(
                                (pre, sr) =>
                                  pre.trim("").length > 0 && (
                                    <>
                                      <Paragraph
                                        className="!text-gray-700 !text-lg !leading-relaxed !mb-0"
                                        key={sr}
                                      >
                                        ✅ {pre}
                                      </Paragraph>
                                    </>
                                  )
                              )}
                            </div>
                          </div>

                          <div>
                            <Title
                              level={3}
                              className="!text-rose-800 !mb-4 flex items-center gap-2"
                            >
                              🎯 What You Will Learn
                            </Title>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                              {course?.learningOutcomes?.split(".").map(
                                (content, sr) =>
                                  content.length > 0 && (
                                    <>
                                      <Paragraph
                                        className="!text-gray-700 !text-lg !leading-relaxed !mb-0"
                                        key={sr}
                                      >
                                        ✅ {content}
                                      </Paragraph>
                                    </>
                                  )
                              )}
                            </div>
                          </div>
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              {/* Pricing Card */}
              <Card
                className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 sticky top-24"
                style={{ borderRadius: "24px" }}
                bodyStyle={{ padding: "32px" }}
              >
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-block">
                    💎 Premium Course
                  </div>
                  <Title level={2} className="!text-rose-600 !mb-2 !text-4xl">
                    ₹{course.price.toLocaleString("en-IN")}
                  </Title>
                  <Text className="text-rose-500 text-lg font-medium">
                    One-time payment • Lifetime access
                  </Text>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mb-8">
                  {!isCoursePurchased && !isOwner && (
                    <Button
                      type="primary"
                      size="large"
                      block
                      className="!h-14 !bg-gradient-to-r !from-pink-500 !to-rose-500 hover:!from-pink-600 hover:!to-rose-600 !border-0 !font-semibold !text-lg !rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      onClick={() => setShowEnrollModal(true)}
                      loading={enrollLoading}
                    >
                      🚀 Enroll Now
                    </Button>
                  )}

                  {isOwner && (
                    <>
                      <Button
                        type="primary"
                        size="large"
                        block
                        className="!h-14 !bg-gradient-to-r !from-amber-500 !to-orange-500 hover:!from-amber-600 hover:!to-orange-600 !border-0 !font-semibold !text-lg !rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        onClick={handleUpdateCourse}
                      >
                        ✏️ Update Course
                      </Button>

                      <DeleteCourseButton courseId={courseId} />
                    </>
                  )}

                  <Button
                    type={isCoursePurchased || isOwner ? "primary" : "default"}
                    size="large"
                    block
                    className={`!h-14 !font-semibold !text-lg !rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                      isCoursePurchased || isOwner
                        ? "!bg-gradient-to-r !from-indigo-500 !to-purple-500 hover:!from-indigo-600 hover:!to-purple-600 !border-0"
                        : "!text-rose-600 !border-2 !border-rose-300 hover:!text-rose-700 hover:!border-rose-400 !bg-gradient-to-r !from-rose-50 !to-pink-50 hover:!from-rose-100 hover:!to-pink-100"
                    }`}
                    onClick={handleViewChapters}
                  >
                    {isCoursePurchased || isOwner
                      ? "📚 Go to Chapters"
                      : "👀 Preview Course"}
                  </Button>
                </div>

                <Divider className="!border-pink-200 !my-8" />

                {/* Course Details */}
                <div className="space-y-4">
                  <Title
                    level={4}
                    className="!text-rose-800 !mb-6 flex items-center gap-2"
                  >
                    📊 Course Details
                  </Title>

                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        ⏰ Duration:
                      </span>
                      <span className="font-bold text-rose-700">
                        {course.duration} hours
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        👨‍🏫 Educator:
                      </span>
                      <Link
                        href={`/profile/${course?.educator?._id}`}
                        className="font-bold text-rose-700"
                      >
                        {course.educatorName}
                      </Link>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        👥 Enrollment:
                      </span>
                      <span className="font-bold text-rose-700">
                        {course.totalEnrollment} students
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        📑 Sections:
                      </span>
                      <span className="font-bold text-rose-700">
                        {course.totalSections}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        🎥 Lectures:
                      </span>
                      <span className="font-bold text-rose-700">
                        {course.totalLectures}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Enhanced Enrollment Modal */}
        {showEnrollModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-pink-200 transform animate-pulse">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 rounded-t-2xl">
                <Title
                  level={3}
                  className="!text-white !mb-2 flex items-center gap-2"
                >
                  🎓 Confirm Enrollment
                </Title>
                <Text className="text-pink-100">
                  Join thousands of successful learners
                </Text>
              </div>

              <div className="p-6">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-200 mb-6">
                  <p className="text-gray-700 text-lg">
                    Ready to start your journey with{" "}
                    <span className="font-bold text-rose-700">
                      {course.title}
                    </span>
                    ?
                  </p>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-pink-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="text-2xl font-bold text-rose-600">
                        ₹{course.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowEnrollModal(false)}
                    className="flex-1 !h-12 !border-2 !border-pink-300 !text-pink-600 hover:!border-pink-400 hover:!text-pink-700 !font-semibold !rounded-xl"
                    size="large"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleEnroll}
                    loading={enrollLoading}
                    className="flex-1 !h-12 !bg-gradient-to-r !from-pink-500 !to-rose-500 hover:!from-pink-600 hover:!to-rose-600 !border-0 !font-semibold !rounded-xl shadow-lg"
                    size="large"
                  >
                    {enrollLoading ? "Processing..." : "💳 Confirm & Pay"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CourseDetailPage;
