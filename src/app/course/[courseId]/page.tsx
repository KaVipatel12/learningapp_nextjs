"use client"

import { useState, useEffect, useCallback } from 'react';
import { 
  Button, Card, Col, Row, Tabs, Tag, Typography, Divider, Rate 
} from 'antd';
import Image from 'next/image';
import UserNav from '@/components/Navbar/UserNav';
import { PageLoading } from '@/components/PageLoading';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/userContext';
import { useEducator } from '@/context/educatorContext';
import DeleteCourseButton from './DeleteButton';
import { useNotification } from '@/components/NotificationContext';

const { Title, Text, Paragraph } = Typography;

interface ICourse {
  _id: string;
  title: string;
  description: string;
  price: number;
  courseImage: string;
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
}

const CourseDetailPage = () => {
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCoursePurchased, setIsCoursePurchased] = useState(false); 
  const [isOwner, setIsOwner] = useState(false); 
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [averageRating , setAverageRating] = useState(0)
  const [totalRatings , setTotalRatings] = useState(0)
  const { showNotification } = useNotification(); 
  
  const { user } = useUser();
  const { educator } = useEducator();
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
          throw new Error('Failed to fetch course');
        }
        
        const data = await response.json();
        setCourse(data.msg);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
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
  if (user && user.purchaseCourse) {
    const purchased = user.purchaseCourse.some(purchase => {
      // Handle both cases where courseId is a string or populated object
      const purchaseCourseId = typeof purchase.courseId === 'object' 
        ? purchase.courseId._id 
        : purchase.courseId;
      return purchaseCourseId === courseId;
    });
    setIsCoursePurchased(purchased);
  }
    // Check if educator owns this course
    if (educator && educator.courses) {
      const owned = educator.courses.some(
        (course) => course._id?.toString() === courseId
      );
      setIsOwner(owned);
    }
  }, [user, educator, courseId]);

  const handleEnroll = async () => {
    try {
      setEnrollLoading(true);

      const res = await fetch("/api/user/purchasecourse", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          courses: [courseId]
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setIsCoursePurchased(false);
        console.log(data.msg)
        setShowEnrollModal(false);
        showNotification(data.msg, "error"); 
        return;
      }
      setIsCoursePurchased(true);
      setShowEnrollModal(false);
      setShowSuccessModal(true);
    } catch {
      showNotification("There is some error please try again later", "error"); 
      setShowEnrollModal(false);
      setShowErrorModal(true);
    } finally {
      setEnrollLoading(false);
    }
  };

  // fetching the average review 
    const fetchReview = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/review//${courseId}/averagerating`)
  
      if (!response.ok) {
        console.log('Failed to submit rating');
      }
  
      const data = await response.json(); 
      console.log(data)
      setAverageRating(data.averageRating || 0);
      setTotalRatings(data.totalRatings || 0);
    } catch{
      console.log("Error in fetching the error")
    } 
    }, [courseId])
  
    useEffect(() => {
      fetchReview()
    }, [fetchReview])

  const handleUpdateCourse = () => {
    router.push(`/educator/editcourse/${courseId}`);
  };

  const handleViewChapters = () => {
      router.push(`/course/${courseId}/chapters`);
  };

  const renderLevelTag = (level: string) => {
    const levelMap: Record<string, string> = {
      beginner: 'green',
      intermediate: 'orange',
      advanced: 'red'
    };
    return <Tag color={levelMap[level.toLowerCase()] || 'blue'}>{level}</Tag>;
  };


  // Custom Modal Component
  const CustomModal = ({ 
    visible, 
    onCancel, 
    title, 
    content, 
    footer, 
    type = 'default' 
  }: {
    visible: boolean;
    onCancel: () => void;
    title: string;
    content: React.ReactNode;
    footer?: React.ReactNode;
    type?: 'default' | 'success' | 'error' | 'warning';
  }) => {
    if (!visible) return null;

    const getColor = () => {
      switch (type) {
        case 'success': return '#52c41a';
        case 'error': return '#f5222d';
        case 'warning': return '#faad14';
        default: return '#1890ff';
      }
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '420px',
          maxWidth: '90%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: getColor(),
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '16px',
              color: 'white',
              fontWeight: 'bold',
            }}>
              {type === 'success' ? '✓' : 
               type === 'error' ? '✕' : 
               type === 'warning' ? '!' : 'i'}
            </div>
            <Title level={4} style={{ margin: 0 }}>{title}</Title>
          </div>
          
          <div style={{ padding: '24px' }}>
            {content}
          </div>
          
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}>
            {footer || (
              <Button onClick={onCancel} type="primary">
                OK
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <>
      <UserNav />
      <div className="course-detail-page" style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Title level={2}>{course.title}</Title>
            
            <div style={{ marginBottom: '16px' }}>
              <Tag color="blue">{course.category}</Tag>
              {renderLevelTag(course.level)}
              <Rate disabled value={averageRating} allowHalf style={{ marginLeft: '16px' }} />
              <Text type="secondary" style={{ marginLeft: '8px' }}>( {totalRatings} users )</Text>
            </div>

            <Card
              cover={
                <div style={{ height: '400px', overflow: 'hidden', position: 'relative' }}>
                  <Image
                    alt={course.title}
                    src={course.courseImage}
                    width={800}
                    height={400}
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              }
            >
              <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
                {
                  key: 'overview',
                  label: 'Overview',
                  children: (
                    <>
                      <Title level={4}>About This Course</Title>
                      <Paragraph>{course.description}</Paragraph>
                      
                      <Divider />
                      
                      <Title level={4}>Prerequisites</Title>
                      <Paragraph>{course.prerequisites}</Paragraph>
                      
                      <Title level={4}>{"What You'll Learn"}</Title>
                      <Paragraph>{course.learningOutcomes}</Paragraph>
                    </>
                  )
                },
              ]} />
            </Card>
          </Col>
  
          <Col xs={24} lg={8}>
            <Card style={{ position: 'sticky', top: '80px', marginTop: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Title level={3} style={{ color: '#1890ff' }}>
                  ₹{course.price.toLocaleString('en-IN')}
                </Title>
                
                {/* Show enroll button only if not purchased and not owner */}
                {(!isCoursePurchased && !isOwner) && (
                  <Button 
                    type="primary" 
                    size="large" 
                    block 
                    style={{ 
                      marginBottom: '16px',
                      background: '#52c41a',
                      borderColor: '#52c41a'
                    }}
                    onClick={() => setShowEnrollModal(true)}
                    loading={enrollLoading}
                  >
                    Enroll Now
                  </Button>
                )}
                
                {/* Show owner buttons */}
                {isOwner && (
                  <>
                    <Button 
                      type="primary" 
                      size="large" 
                      block 
                      style={{ 
                        marginBottom: '16px',
                        background: '#faad14',
                        borderColor: '#faad14'
                      }}
                      onClick={handleUpdateCourse}
                    >
                      Update Course
                    </Button>
                    
                    <DeleteCourseButton courseId={courseId} />
                  </>
                )}
                
                {/* View chapters button */}
                <Button 
                  type={isCoursePurchased || isOwner ? "primary" : "default"}
                  size="large" 
                  block 
                  style={{ 
                    marginBottom: '24px',
                    ...(isCoursePurchased || isOwner ? {} : {
                      color: '#1890ff',
                      borderColor: '#1890ff'
                    })
                  }}
                  onClick={handleViewChapters}
                >
                  {isCoursePurchased || isOwner ? "Go to Chapters" : "Preview Course"}
                </Button>
              </div>

              <Divider />
              
              <div style={{ marginBottom: '16px' }}>
                <Paragraph>
                  <Text strong>Duration:</Text> {course.duration} hours
                </Paragraph>
                <Paragraph>
                  <Text strong>Educator:</Text> {course.educatorName}
                </Paragraph>
                <Paragraph>
                  <Text strong>Total Enrollment:</Text> {course.totalEnrollment}
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Custom Modals */}
      <CustomModal
        visible={showEnrollModal}
        onCancel={() => setShowEnrollModal(false)}
        title="Confirm Enrollment"
        type="default"
        content={
          <div>
            <p>Are you sure you want to enroll in `{course.title}`  for ₹{course.price.toLocaleString('en-IN')}?</p>
          </div>
        }
        footer={
          <>
            <Button onClick={() => setShowEnrollModal(false)}>Cancel</Button>
            <Button 
              type="primary" 
              onClick={handleEnroll}
              loading={enrollLoading}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Enroll Now
            </Button>
          </>
        }
      />

      <CustomModal
        visible={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        title="Enrollment Successful"
        type="success"
        content="You have successfully enrolled in this course!"
      />

      <CustomModal
        visible={showErrorModal}
        onCancel={() => setShowErrorModal(false)}
        title="Enrollment Failed"
        type="error"
        content="There was an error processing your enrollment. Please try again."
      />

      <CustomModal
        visible={showWarningModal}
        onCancel={() => setShowWarningModal(false)}
        title="Enrollment Required"
        type="warning"
        content="Please enroll in this course to view chapters"
      />
    </>
  );
};

export default CourseDetailPage;