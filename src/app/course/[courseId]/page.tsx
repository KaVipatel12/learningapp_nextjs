"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Card, Tabs, Typography, Divider, Rate, Row, Col, Alert, Modal } from "antd";
import Image from "next/image";
import { PageLoading } from "@/components/PageLoading";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import DeleteCourseButton from "./DeleteButton";
import { useNotification } from "@/components/NotificationContext";
import ErrorPage from "@/components/ErrorPage";
import Link from "next/link";

const { Title, Text, Paragraph } = Typography;
// const { confirm } = Modal;

type CourseStatus = 'pending' | 'approved' | 'rejected' | 'restricted';

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
  status: CourseStatus;
  rejectionReason?: string;
  educator: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const CourseDetailPage = () => {
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isCoursePurchased, setIsCoursePurchased] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const { showNotification } = useNotification();

  const { user, fetchUserData } = useUser();
  const params = useParams();
  const router = useRouter();

  const courseId = params.courseId as string;

  // Check if user can view the course
  const canViewCourse = useCallback(() => {
    if (!course) return false;
    
    // Always show to admin and owner
    if (isAdmin || isOwner) return true;
    
    // Only show approved courses to regular users
    return course.status === 'approved';
  }, [course, isAdmin, isOwner]);

  // Check if user can purchase the course
  const canPurchaseCourse = useCallback(() => {
    if (!course) return false;
    
    // Only allow purchase if:
    // - Course is approved
    // - User is not owner/admin
    // - User hasn't already purchased
    // - User is logged in
    return course.status === 'approved' && 
           !isOwner && 
           !isAdmin && 
           !isCoursePurchased && 
           !!user;
  }, [course, isOwner, isAdmin, isCoursePurchased, user]);

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
        console.log(data.msg)
        setCourse(data.msg);
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

  // Check permissions

  useEffect(() => {
    // Reset states first
    setIsCoursePurchased(false);
    setIsOwner(false);
    setIsAdmin(false);

    if (user) {
      // Check if user is admin
      if (user.role === 'admin') {
        setIsAdmin(true);
      }

      // Check if user has purchased the course
      if (user.purchaseCourse && Array.isArray(user.purchaseCourse)) {
        const purchased = user.purchaseCourse.some((purchase) => {
          if (!purchase || !purchase.courseId) return false;
          
          let purchaseCourseId;
          if (typeof purchase.courseId === "object") {
            purchaseCourseId = purchase.courseId?._id;
          } else {
            purchaseCourseId = purchase.courseId;
          }
          
          return purchaseCourseId && purchaseCourseId.toString() === courseId;
        });
        setIsCoursePurchased(purchased);
      }

      // Check if user owns the course
      if (user.courses && Array.isArray(user.courses)) {
        const owned = user.courses.some((course) => {
          if (!course?._id) return false;
          
          const courseIdStr = typeof course?._id === 'object' 
            ? course?._id 
            : String(course?._id);
          
          return courseIdStr === courseId;
        });
        setIsOwner(owned);
      }
    }
  }, [user, courseId]);

  const handleEnroll = async () => {
    try {
      setEnrollLoading(true);

      if (!user) {
        showNotification("Please login to enroll in courses", "error");
        router.push("/login");
        return;
      }

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
        showNotification(data.msg || "Enrollment failed", "error");
        return;
      }

      setIsCoursePurchased(true);
      setShowEnrollModal(false);
      fetchUserData();
      showNotification("Enrollment successful!", "success");
    } catch (err) {
      console.error("Enrollment error:", err);
      showNotification("There was an error processing your enrollment", "error");
    } finally {
      setEnrollLoading(false);
    }
  };

  // Fetch the average review
  const fetchReview = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/user/review/${courseId}/averagerating`
      );
      if (!response.ok) {
        console.log("Failed to fetch rating");
        return;
      }
      const data = await response.json();
      setAverageRating(data.averageRating || 0);
      setTotalRatings(data.totalRatings || 0);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  }, [courseId]);

  useEffect(() => {
    if (course?.status === 'approved') {
      fetchReview();
    }
  }, [fetchReview, course?.status]);

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

 const renderStatusBadge = (status: CourseStatus) => {
  const statusMap = {
    pending: {
      text: "Pending Review",
      color: "bg-yellow-100 text-yellow-800",
      icon: "⏳",
    },
    approved: {
      text: "Published",
      color: "bg-green-100 text-green-800",
      icon: "✅",
    },
    rejected: {
      text: "Rejected",
      color: "bg-red-100 text-red-800",
      icon: "❌",
    },
    restricted: {
      text: "Restricted",
      color: "bg-orange-100 text-orange-800",
      icon: "🚫",
    },
  };

  // Fallback to pending if status is not recognized
  const currentStatus = statusMap[status] || statusMap.pending;

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${currentStatus.color} flex items-center gap-1`}
    >
      {currentStatus.icon} {currentStatus.text}
    </span>
  );

};

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <ErrorPage error={error} />;
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
            {"The course you are looking for doesn't exist."}
          </p>
          <Button 
            type="primary" 
            className="mt-4 bg-rose-500 hover:bg-rose-600"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Check if user can view the course
  if (!canViewCourse()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-200 max-w-md w-full">
          <div className="text-rose-500 text-6xl mb-4">
            {course.status === 'rejected' ? '🚫' : '🔒'}
          </div>
          <h2 className="text-2xl font-bold text-rose-800 mb-2">
            {course.status === 'rejected' 
              ? 'Course Rejected' 
              : course.status === 'restricted'
                ? 'Course Restricted'
                : 'Course Under Review'}
          </h2>
          
          <div className="mb-6">
            {renderStatusBadge(course.status)}
          </div>

          {course.status === 'rejected' && course.rejectionReason && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-rose-800 mb-2">Reason:</h4>
              <p className="text-rose-700">{course.rejectionReason}</p>
            </div>
          )}

          <p className="text-rose-600 mb-6">
            {course.status === 'rejected' 
              ? 'This course has been rejected by our team and is not available for viewing.'
              : course.status === 'restricted'
                ? 'This course has been restricted and is not currently available.'
                : 'This course is under review and not yet published.'}
          </p>

          {isOwner && (
            <div className="space-y-3">
              <Button 
                type="primary" 
                onClick={() => router.push('/educator/mycourses')}
                className="bg-rose-500 hover:bg-rose-600 w-full"
                size="large"
              >
                Back to My Courses
              </Button>
              {course.status === 'rejected' && (
                <Button 
                  onClick={handleUpdateCourse}
                  className="w-full"
                  size="large"
                >
                  ✏️ Edit and Resubmit
                </Button>
              )}
            </div>
          )}

          {!user && (
            <Button 
              type="primary" 
              onClick={() => router.push('/login')}
              className="bg-rose-500 hover:bg-rose-600 w-full mt-4"
              size="large"
            >
              Login to View Your Courses
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen mb-20 ">
        {/* Status Alert for Admin/Owner */}

        
        {(isAdmin || isOwner) && course.status !== 'approved' && (
          <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="mt-13">
            <Alert 
              message={
                <div className="flex items-center gap-2">
                  {renderStatusBadge(course.status)}
                  {course.status === 'rejected' && course.rejectionReason && (
                    <span className="text-gray-600">Reason: {course.rejectionReason}</span>
                  )}
                </div>
              }
              type={
                course.status === 'rejected' 
                  ? 'error' 
                  : course.status === 'restricted' 
                    ? 'warning' 
                    : 'info'
              }
              showIcon
              className="mb-6"
              description={
                course.status === 'rejected' 
                  ? 'Only you and admins can see this course. Please update the course and resubmit for review.' 
                  : course.status === 'restricted' 
                    ? 'This course is not visible to students until restrictions are removed.' 
                    : 'Your course is under review and not yet visible to students.'
              } 
            />
            </div>
          </div>
        )}
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-pink-600 via-rose-500 to-cherry-600 text-white py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/20 via-rose-800/20 to-cherry-900/20"></div>
          <div className="relative max-w-7xl mx-auto px-6 mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                    {course.category}
                  </span>
                  {renderLevelTag(course.level)}
                  {(isAdmin || isOwner) && renderStatusBadge(course.status)}
                </div>

                <Title
                  level={1}
                  className="!text-white !text-4xl lg:!text-5xl !font-bold !mb-6 leading-tight"
                >
                  {course.title}
                </Title>

                {course.status === 'approved' && (
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
                )}

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

                          {course.prerequisites && (
                            <div>
                              <Title
                                level={3}
                                className="!text-rose-800 !mb-4 flex items-center gap-2"
                              >
                                ✅ Prerequisites
                              </Title>
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                                {course.prerequisites.split(".").map(
                                  (pre, idx) =>
                                    pre.trim().length > 0 && (
                                      <Paragraph
                                        className="!text-gray-700 !text-lg !leading-relaxed !mb-2"
                                        key={`pre-${idx}`}
                                      >
                                        ✅ {pre.trim()}
                                      </Paragraph>
                                    )
                                )}
                              </div>
                            </div>
                          )}

                          {course.learningOutcomes && (
                            <div>
                              <Title
                                level={3}
                                className="!text-rose-800 !mb-4 flex items-center gap-2"
                              >
                                🎯 What You Will Learn
                              </Title>
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                                {course.learningOutcomes.split(".").map(
                                  (content, idx) =>
                                    content.trim().length > 0 && (
                                      <Paragraph
                                        className="!text-gray-700 !text-lg !leading-relaxed !mb-2"
                                        key={`outcome-${idx}`}
                                      >
                                        ✅ {content.trim()}
                                      </Paragraph>
                                    )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: "educator",
                      label: (
                        <span className="flex items-center gap-2 font-semibold text-lg">
                          👨‍🏫 Educator
                        </span>
                      ),
                      children: (
                        <div className="space-y-6">
                          <div className="flex items-center gap-6">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-rose-200">
                              <Image
                                src={"/default-avatar.png"}
                                alt={course.educatorName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <Title level={4} className="!mb-1">
                                {course.educatorName}
                              </Title>
                              <Text type="secondary">
                                Course Instructor
                              </Text>
                            </div>
                          </div>
                          <Button 
                            type="primary" 
                            onClick={() => router.push(`/profile/${course.educator?._id}`)}
                            className="bg-rose-500 hover:bg-rose-600"
                          >
                            View Educator Profile
                          </Button>
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
              >
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-block">
                    {course.status === 'approved' ? '💎 Premium Course' : '📝 Under Review'}
                  </div>
                  <Title level={2} className="!text-rose-600 !mb-2 !text-4xl">
                    ₹{course.price.toLocaleString("en-IN")}
                  </Title>
                  <Text className="text-rose-500 text-lg font-medium">
                    {course.status === 'approved' 
                      ? 'One-time payment • Lifetime access' 
                      : 'Price will be active after approval'}
                  </Text>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mb-8">
                  {canPurchaseCourse() && (
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

                  {!user && course.status === 'approved' && (
                    <Button
                      type="primary"
                      size="large"
                      block
                      className="!h-14 !bg-gradient-to-r !from-pink-500 !to-rose-500 hover:!from-pink-600 hover:!to-rose-600 !border-0 !font-semibold !text-lg !rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      onClick={() => router.push('/login')}
                    >
                      🔒 Login to Enroll
                    </Button>
                  )}

                  {(isCoursePurchased || isOwner || isAdmin) && (
                    <Button
                      type="primary"
                      size="large"
                      block
                      className="!h-14 !bg-gradient-to-r !from-indigo-500 !to-purple-500 hover:!from-indigo-600 hover:!to-purple-600 !border-0 !font-semibold !text-lg !rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      onClick={handleViewChapters}
                    >
                      📚 Go to Chapters
                    </Button>
                  )}

                  {!isCoursePurchased && !isOwner && !isAdmin && course.status === 'approved' && (
                    <Button
                      type="default"
                      size="large"
                      block
                      className="!h-14 !text-rose-600 !border-2 !border-rose-300 hover:!text-rose-700 hover:!border-rose-400 !bg-gradient-to-r !from-rose-50 !to-pink-50 hover:!from-rose-100 hover:!to-pink-100 !font-semibold !text-lg !rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      onClick={handleViewChapters}
                    >
                      👀 Preview Course
                    </Button>
                  )}

                  {(isOwner || isAdmin) && (

                    <>
                     {isOwner && (
                      <Button
                        type="primary"
                        size="large"
                        block
                        className="!h-14 !bg-gradient-to-r !from-amber-500 !to-orange-500 hover:!from-amber-600 hover:!to-orange-600 !border-0 !font-semibold !text-lg !rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        onClick={handleUpdateCourse}
                      >
                        ✏️ Update Course
                      </Button>
                     )}
                     
                      <DeleteCourseButton courseId={courseId} />
                    </>
                  )}


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
                        href={`/user/profile/${course.educator?._id}`}
                        className="font-bold text-rose-700 hover:text-rose-800"
                      >
                        {course.educatorName}
                      </Link>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        📅 Created:
                      </span>
                      <span className="font-bold text-rose-700">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
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

        {/* Enrollment Modal - Only show if course is approved */}
        {course.status === 'approved' && showEnrollModal && (
          <Modal
            open={showEnrollModal}
            onCancel={() => setShowEnrollModal(false)}
            footer={null}
            centered
            className="rounded-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-1">
              <div className="bg-white p-6 rounded-xl">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🎓
                  </div>
                  <Title level={3} className="!mb-2">
                    Confirm Enrollment
                  </Title>
                  <Text type="secondary">
                    Join thousands of successful learners
                  </Text>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-200 mb-6">
                  <p className="text-gray-700 text-lg text-center mb-4">
                    You're enrolling in:{" "}
                    <span className="font-bold text-rose-700">
                      {course.title}
                    </span>
                  </p>
                  <div className="p-4 bg-white rounded-lg border border-pink-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Course Price:</span>
                      <span className="text-lg font-semibold text-rose-600">
                        ₹{course.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Amount:</span>
                      <span className="text-xl text-rose-600">
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
          </Modal>
        )}
      </div>
    </>
  );
};

export default CourseDetailPage;