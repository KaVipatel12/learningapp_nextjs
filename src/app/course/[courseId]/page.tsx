"use client"

import { useState, useEffect } from 'react';
import { 
  Button, Card, Col, Row, Tabs, Tag, Typography, Divider, Rate 
} from 'antd';
import { TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import UserNav from '@/components/Navbar/UserNav';
import { PageLoading } from '@/components/PageLoading';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/userContext';
import { useEducator } from '@/context/educatorContext';
import Link from 'next/link';
import DeleteCourseButton from './DeleteButton';


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
  educatorName: string;
  isPublished: boolean;
  prerequisites: string;
  learningOutcomes: string;
  // Add other fields as needed
}

const CourseDetailPage = () => {
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCoursePurchased, setIsCoursePurchased] = useState(false); 
  const [isOwner, setIsOwner] = useState(false); 
  
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
      const purchased = user.purchaseCourse.some(course => course.courseId?.toString() === courseId);
      setIsCoursePurchased(!purchased);
    }
    
    // Check if educator owns this course
    if (educator && educator.courses) {
      const owned = educator?.courses?.some(id => 
        id?.toString() === courseId
      );
      setIsOwner(owned);
    }
  }, [user, educator, courseId]);

  const handleEnrollCourse = async () => {
    // Add your enrollment logic here
    console.log('Enrolling in course:', courseId);
  };

  const handleUpdateCourse = () => {
    router.push(`/educator/courses/edit/${courseId}`);
  };

  const handleViewChapters = () => {
    if (isCoursePurchased || isOwner) {
      router.push(`/course/${courseId}/chapters`);
    } else {
      alert('Please enroll in this course to view chapters');
    }
  };

  const renderLevelTag = (level: string) => {
    const levelMap: Record<string, string> = {
      beginner: 'green',
      intermediate: 'orange',
      advanced: 'red'
    };
    return <Tag color={levelMap[level.toLowerCase()] || 'blue'}>{level}</Tag>;
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
              <Rate disabled value={4.5} allowHalf style={{ marginLeft: '16px' }} />
              <Text type="secondary" style={{ marginLeft: '8px' }}>(124 reviews)</Text>
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
                // Add other tabs as needed
              ]} />
            </Card>
          </Col>
  
          <Col xs={24} lg={8}>
            <Card style={{ position: 'sticky', top: '80px', marginTop: '20px' }}>
              {/* Price and action buttons */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Title level={3} style={{ color: '#1890ff' }}>
                  ₹{course.price.toLocaleString('en-IN')}
                </Title>
                
                {/* Show different buttons based on user role and purchase status */}
                {!isCoursePurchased && !isOwner && (
                  <Button 
                    type="primary" 
                    size="large" 
                    block 
                    style={{ marginBottom: '16px' }}
                    onClick={handleEnrollCourse}
                  >
                    Enroll Now
                  </Button>
                )}
                
                {/* Show these buttons only to course owners (educators) */}
                {isOwner && (
                  <>
                    <Button 
                      type="default" 
                      size="large" 
                      block 
                      style={{ marginBottom: '16px', borderColor: '#1890ff', color: '#1890ff' }}
                      onClick={handleUpdateCourse}
                    >
                      Update Course
                    </Button>
                    
                    {/* Replace the old delete button with our new component */}
                    <DeleteCourseButton courseId={courseId} />
                  </>
                )}
                
                {/* View chapters button (accessible to enrolled students and owners) */}
                <Button 
                  type={isCoursePurchased || isOwner ? "primary" : "dashed"}
                  size="large" 
                  block 
                  style={{ marginBottom: '24px' }}
                  onClick={handleViewChapters}
                >
                <Link href={`${params.courseId}/chapters`}> {isCoursePurchased || isOwner ? "Go to Chapters" : "View All Chapters"} </Link> 
                </Button>
              </div>

              <Divider />
              
              {/* Course meta information */}
              <div style={{ marginBottom: '16px' }}>
                <Paragraph>
                  <ClockCircleOutlined style={{ marginRight: '8px' }} />
                  <Text strong>Duration:</Text> {course.duration} hours
                </Paragraph>
                <Paragraph>
                  <TeamOutlined style={{ marginRight: '8px' }} />
                  <Text strong>Educator:</Text> {course.educatorName}
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default CourseDetailPage;