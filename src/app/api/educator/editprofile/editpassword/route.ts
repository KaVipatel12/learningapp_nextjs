import { connect } from '@/db/dbConfig';
import { NextRequest, NextResponse } from 'next/server';
import { AuthContext, authEducatorMiddleware } from '@/app/middleware/authEducatorMiddleware';
import { Educator } from '@/models/models';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest) {
  await connect();

  try {
    // Authenticate the user
    const authResult = await authEducatorMiddleware(req);

    // If authentication fails, return the response
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Destructure educator from the authentication result
    const { educator } = authResult as AuthContext;

    // If no educator is found, return an error response
    if (!educator) {
      return NextResponse.json(
        { msg: "Authentication failed" },
        { status: 401 }
      );
    }

    // Parse the incoming request body (password data)

    const body = await req.json()
    const { current, new: newPassword, confirm } = body.passwords;

    // Validate if the new password and confirm password match
    if (newPassword !== confirm) {
      return NextResponse.json(
        { msg: "New password and confirm password do not match" },
        { status: 400 }
      );
    }

    // Compare current password with the stored password (hashed)
    const isMatch = await bcrypt.compare(current, educator.password);
    if (!isMatch) {
      return NextResponse.json(
        { msg: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const updatedUser = await Educator.findByIdAndUpdate(educator._id, {
      password: hashedPassword,
    }, { new: true });

    // If no user was updated, return an error response
    if (!updatedUser) {
      return NextResponse.json(
        { msg: "There is an error updating the password" },
        { status: 400 }
      );
    }

    console.log('Password Updated:', updatedUser);

    // Send the email notification
    await sendEmailNotification("chocobhai24811@gmail.com");

    // Return success response
    return NextResponse.json(
      {
        msg: "Password updated successfully",
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error updating educator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        msg: "Failed to update password",
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

// Function to send email using Nodemailer
async function sendEmailNotification(userEmail: string) {
  try {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use any email service here
      auth: {
        user: process.env.EMAIL_USER, // Use your email (Gmail or any SMTP email)
        pass: process.env.EMAIL_PASS, // Use your email app password
      }
    });

    // Email message options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email
      to: userEmail, // Recipient email (educator's email)
      subject: 'Password Change Notification Education app',
      text: 'Your password has been successfully updated. If you did not request this change, please contact support immediately.',
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
