# 📚 Learnify - Full Stack Education Platform Built with Next.js

![Learnify Banner](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/icon-192.png)

Learnify is a comprehensive, full-stack education platform powered by the MERN stack with **Next.js App Router**. It supports role-based access (Admin, Educator, Student), Google OAuth/JWT authentication, course management, real-time notifications, reporting, and more — perfect for scalable educational experiences.

---

## ✨ Features Overview

### 👥 Authentication
- 🔐 JWT-based registration & login
- 🔗 Google OAuth integration
- 🍪 Secure cookies for token storage
- 🧑‍💼 Role-Based Access Control: `Admin`, `Educator`, `Student`

### 📚 Learning & Course Features
- 🏠 Home page with recommended/featured courses
- 🔍 Category-based filtering
- 💖 Wishlist system
- 🛒 Dummy purchase flow
- 📄 Course details with:
  - 🗣️ Comments, ⭐ Reviews
  - 🚨 Reporting for content
  - ✏️ Educator controls: edit/delete
  - 🛑 Admin controls: restrict/delete

### 🧑‍🏫 Educator Capabilities
- 📤 Add/update/delete courses and chapters
- ☁️ Cloudinary integration for media uploads
- 📝 Quiz creation system

### 🛠️ Admin Panel
- 📦 Course verification
- 🔎 View & manage reports
- ❌ Delete/restrict content or users
- 🚨 Issue warnings
- 👤 User management

### 🔔 Real-Time Notifications
- 🔔 Notification bar for warnings, approvals, reports, etc.

### 📧 Forgot Password Flow
- 📩 OTP-based password reset via email

---

## 📸 UI Snapshots

### 🔑 Registration Page (OAuth Integration)
![Registration Page](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/registerpage.PNG)

---

### 🏷️ Category Pages (For Students & Educators)
- Personalized recommendations
![Category 1](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/categorypage1.PNG)
![Category 2](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/categorypage2.PNG)

---

### 🏠 Home Page
- Shows top-rated and new courses
![Home Page](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/home1.PNG)

---

### 🧑‍💼 Admin Panel
- Dashboard  
  ![Admin Panel 1](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/adminpanel1.PNG)
- User Management  
  ![Admin Panel 2](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/adminpanel2.PNG)
- Report Center  
  ![Admin Panel 3](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/adminpanel3.PNG)
- Course Approval  
  ![Admin Panel 4](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/adminpanel4.PNG)

---

### 🧾 Course Browsing Page
![Course Browse](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/coursepage.PNG)

---

### 📘 Course Landing Pages
- 👨‍🎓 Student View  
  ![Course Page - User](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/coursemain.PNG)
- 👩‍🏫 Educator View  
  ![Course Page - Owner](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/coursemain1.PNG)

---

### 📖 Chapter Pages
- Student view  
  ![Chapter Page](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/chaptermain.PNG)
- Educator functionality  
  ![Chapter Edit](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/chaptermain2.PNG)

---

### 🎥 Video Lecture Page
- Comments, reviews, report, video history tracking
![Video Page](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/course.PNG)

---

### 🔔 Notification Bar
![Notification](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/notification.PNG)

---

### 🧪 Quiz System
- Interactive quiz interface  
  ![Quiz 1](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/quiz1.PNG)
- Quiz results  
  ![Quiz Result](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/quiz2.PNG)
- Quiz history  
  ![Quiz History](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/quiz3.PNG)

---

### 💖 Wishlist Page
![Wishlist](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/wishlist.PNG)

---

### ➕ Educator: Add Course / Quiz
![Add Course](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/courseadd.PNG)  
![Add Quiz](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/addquiz.PNG)

---

### 👤 Profile Page
![Profile 1](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/profile1.PNG)  
![Profile 2](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/profile2.PNG)

---

### ⚙️ Settings Page
![Settings](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/settings.PNG)

---

### 🔐 Forgot Password Flow (OTP)
![Forgot Password](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/forgetpassword.PNG)

---

### ⛔ Restricted User Page
![Restricted User](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/restrictedpage.PNG)

---

### ⛔ Restricted Course Page
![Restricted Course](https://github.com/KaVipatel12/learningapp_nextjs/blob/main/public/assets/courserestrict.PNG)

---

## ⚙️ Tech Stack

- 💻 **Frontend**: Next.js (App Router), TailwindCSS, TypeScript, Zustand
- 🔐 **Auth**: JWT + Google OAuth (cookies)
- 🌐 **Backend**: Node.js, Express, MongoDB
- ☁️ **Storage**: Cloudinary
- 📡 **Notifications**: In-app alerts & moderation logs

---

## 📦 Installation

```bash
git clone https://github.com/KaVipatel12/learningapp_nextjs.git
cd learningapp_nextjs
npm install
