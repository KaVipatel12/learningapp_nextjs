"use client"

import { FC, useState } from 'react';
import { Button, Modal, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface DeleteCourseButtonProps {
    courseId: string; // ✅ Proper type
  }
  
  const DeleteCourseButton: FC<DeleteCourseButtonProps> = ({ courseId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const showDeleteConfirm = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/educator/deletecourse/${courseId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Wait a moment to show the loading state to the user
        setTimeout(() => {
          setIsDeleting(false);
          setIsModalOpen(false);
          router.push('/educator/profile');
        }, 500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setIsDeleting(false);
      alert(`An error occurred: ${error}`);
    }
  };

  return (
    <>
      <Button 
        danger
        type="default" 
        size="large" 
        block 
        style={{ marginBottom: '16px' }}
        onClick={showDeleteConfirm}
      >
        Delete Course
      </Button>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
            Confirm Course Deletion
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </Button>,
          <Button 
            key="delete" 
            danger 
            type="primary" 
            onClick={handleDelete}
            loading={isDeleting}
          >
            Delete
          </Button>
        ]}
        centered
      >
        <p>Are you sure you want to delete this course?</p>
        <p>This action will permanently delete:</p>
        <ul>
          <li>All course content and details</li>
          <li>All chapters and associated videos</li>
          <li>The course thumbnail image</li>
        </ul>
        <p><strong>This action cannot be undone.</strong></p>
      </Modal>

      {/* Global loading overlay */}
      {isDeleting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <Spin size="large" />
            <div>Deleting course and all associated resources...</div>
            <div>Please wait</div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteCourseButton;