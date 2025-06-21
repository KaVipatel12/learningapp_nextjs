"use client"
import { Spin } from 'antd';
import React, { ReactNode } from 'react';

interface PleaseWaitProps {
    message: string | ReactNode;
}

const PleaseWait: React.FC<PleaseWaitProps> = ({ message }) => {
    return (
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
                <div>{message}</div>
                <div>Please wait</div>
            </div>
        </div>
    );
};

export default PleaseWait;