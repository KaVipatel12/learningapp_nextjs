"use client"

import { FC, useState } from 'react';
import { Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/NotificationContext';
import { useUser } from "@/context/userContext";
import PleaseWait from '@/components/PleaseWait';

interface DeleteCourseButtonProps {
    courseId: string; 
  }
  
  const DeleteCourseButton: FC<DeleteCourseButtonProps> = ({ courseId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification()
  const { fetchUserData } = useUser()

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
          setIsDeleting(false);
          setIsModalOpen(false);
          fetchUserData(); 
          return router.push('/user/profile');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to delete course', "error");
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setIsDeleting(false);
      showNotification(`An error occurred`, "error");
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
        <PleaseWait message="Deleting course and all associated resources..."/>
      )}
    </>
  );
};

export default DeleteCourseButton;