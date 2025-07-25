"use client";

import { useState } from "react";
import { Button, Modal, Input, message } from "antd";
import { useNotification } from "../NotificationContext";

const { TextArea } = Input;

type ReportType = "chapter" | "comment";

interface ReportToggleProps {
  type: ReportType;
  onReportSuccess?: () => void;
  buttonProps?: {
    size?: "small" | "middle" | "large";
    style?: React.CSSProperties;
    className?: string;
  };
  courseId : string
  chapterId : string
  commentId : string
}

const ReportToggle = ({
  type,
  courseId, 
  commentId , 
  chapterId , 
  onReportSuccess,
  buttonProps = {},
}: ReportToggleProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification()
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!reportReason.trim()) {
      message.warning("Please provide a reason for reporting");
      return;
    }

    setIsLoading(true);

    try {
       
      const data = { description : reportReason , courseId , chapterId : chapterId , commentId : commentId || null}
      const endpoint = `/api/admin/report/reportsubmit`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const res = await response.json(); 
      if (!response.ok) {
       return showNotification(res.message , 'error');
      }

      showNotification("Report sent successfully", "success")
      setIsModalOpen(false);
      setReportReason("");
      onReportSuccess?.();
    } catch (error) {
    showNotification("There is some error", "error")
      console.error("Reporting error:", error);
      message.error("Error submitting report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setReportReason("");
  };

  const getTitle = () => {
    return type === "chapter" 
      ? "Report Course" 
      : "Report Comment";
  };

  const getPlaceholder = () => {
    return type === "chapter"
      ? "What's the issue with this chapter? (e.g., inappropriate content, misinformation)"
      : "What's the issue with this comment? (e.g., harassment, spam)";
  };

  return (
    <>
      <Button
        type="text"
        danger
        onClick={showModal}
        icon={<span>⚠️</span>}
        {...buttonProps}
      >
        Report
      </Button>

      <Modal
        title={getTitle()}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={isLoading}
        okText="Submit Report"
        cancelText="Cancel"
      >
        <div className="mt-4">
          <TextArea
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder={getPlaceholder()}
            maxLength={500}
            showCount
          />
          <p className="text-gray-500 text-sm mt-2">
            Your report will be reviewed by our moderation team.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default ReportToggle;