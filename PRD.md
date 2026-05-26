\# PRD — Project Requirements Document



\## 1. Overview



This application is a \*\*Portfolio Landing Page\*\* designed to host and showcase all user projects or work outputs with richer details. The primary problem it aims to solve is the disorganized, hard-to-contact, or less informative presentation of portfolios regarding the technologies used. With this landing page, creators can have a single, centralized web page that is neat, professional, and interactive. The main goal is to make it easier for visitors (recruiters, clients, colleagues) to view a complete list of projects featuring preview images and technology lists, download a CV, and easily contact the owner via an integrated contact form.



\## 2. Requirements



\- \*\*Minimalist and Clean Design:\*\* The interface must be clean, structured, and intuitive so that visitor focus remains on the work and key information.

\- \*\*Responsive:\*\* The page must function seamlessly across \_smartphones\_, tablets, and desktop devices.

\- \*\*Fast Performance:\*\* Quick load times to maintain visitor retention.

\- \*\*Dynamic (Simple CMS):\*\* The owner can manage project content, profile, and CV without touching the source code.

\- \*\*In-depth Project Details:\*\* Each project must display a \_preview\_ image (thumbnail) and a list of \_tech stack\_ technologies used to provide better context for visitors.

\- \*\*Directed Navigation:\*\* Facilitate visitors to directly click project links to external sites or live demos.

\- \*\*Centralized CV Access:\*\* An easily manageable and downloadable CV (PDF) feature.

\- \*\*Contact Interaction:\*\* Visitors must be able to contact the owner via a contact form including Name, Email, Subject, and Message inputs.

\- \*\*Social Media Integration:\*\* Display links to the owner's social profiles (LinkedIn, GitHub, Instagram) for broader networking.



\## 3. Core Features



\- \*\*Hero Section \& Profile:\*\* Brief owner introduction with name, bio description, and primary action buttons (Download CV \& Contact).

\- \*\*Project Showcase (Updated):\*\*

&#x20; - Displays a list of projects in a card (\_cards\_) format with attractive \_thumbnail\_ images.

&#x20; - Shows labels/tags for the \*\*Tech Stack\*\* used in each project (e.g., React, Node.js, Tailwind).

&#x20; - Project Title and \_Link\_ directing to the live work.

\- \*\*Contact Form:\*\* Interactive form for visitors to send messages to the owner. Inputs include:

&#x20; - Name

&#x20; - Email

&#x20; - Subject

&#x20; - Message

\- \*\*Social Links:\*\* Icons or text links directing to the owner's professional social media accounts.

\- \*\*Status Notifications:\*\* Visitors receive feedback (success/failure) after attempting to send a contact message.

\- \*\*Admin Page (Simple Dashboard):\*\* A hidden panel for the owner to:

&#x20; - Manage profile data and upload CV files.

&#x20; - Add, edit, or delete projects (including uploading preview images and writing technology lists).



\## 4. User Flow



\*\*Visitor Journey:\*\*



1\. Visitor opens the Landing Page URL.

2\. Visitor views the Hero Section, can download the CV, or check Social Links in the bottom navigation.

3\. Visitor scrolls to the "Project List" section.

4\. Visitor views project cards with Preview images and a list of Technologies.

5\. Visitor clicks the title or link to view project details in a new tab (external).

6\. Visitor scrolls down to the "Contact" section.

7\. Visitor fills out the form (Name, Email, Subject, Message) and clicks "Send Message".

8\. System validates input. If successful, displays a "Message Sent" notification and resets the form. If failed, displays an error notification.



\*\*Owner (Admin) Journey:\*\*



1\. Owner logs into the secret admin page.

2\. \*\*Manage CV:\*\* Owner uploads a new PDF CV via the settings panel and saves it.

3\. \*\*Manage Projects:\*\*

&#x20;  - Owner fills out the new project addition form.

&#x20;  - Inputs: Title, Link URL, Upload Preview Image, Tech Stack List (e.g., comma-separated).

&#x20;  - Owner clicks the "Save" button.

4\. System saves the data. The Landing Page automatically updates to display the latest project with the correct image and tech stack.



\## 5. Architecture



This system uses a modern \_Client-Server\_ web architecture within a single application (Full-stack Next.js). The backend handles contact form validation, database storage, email service integration (if needed), and file storage management (images and CV).



```mermaid

sequenceDiagram

&#x20;   participant V as Visitor / Admin

&#x20;   participant F as Frontend (UI / Interface)

&#x20;   participant B as Backend (Server / API)

&#x20;   participant D as Database

&#x20;   participant S as Storage (CV \& Images)

&#x20;   participant E as Email Notification (Optional)



&#x20;   %% Visitor Flow - View Projects

&#x20;   V->>F: Access Landing Page

&#x20;   F->>B: Request profile, CV, \& project list data

&#x20;   B->>D: Fetch data from users \& projects tables

&#x20;   D-->>B: Return complete data including image\_url, tech\_stack, cv\_url

&#x20;   B-->>F: Return data

&#x20;   F-->>V: Display complete landing page (Preview \& Tags)



&#x20;   %% Visitor Flow - Contact

&#x20;   V->>F: Fill Contact Form \& Click Send

&#x20;   F->>B: Send form data (POST /api/contact)

&#x20;   alt Validation Successful

&#x20;       B->>D: Save message to messages table

&#x20;       B->>E: Send email notification to Admin (Optional via Resend)

&#x20;       B-->>F: Success Response (200)

&#x20;       F-->>V: Display "Message Sent" Notification

&#x20;   else Validation Failed / Error

&#x20;       B-->>F: Error Response

&#x20;       F-->>V: Display "Failed to Send" Notification

&#x20;   end



&#x20;   %% Admin Flow - Manage Projects \& CV

&#x20;   V->>F: Admin login \& add project/upload CV

&#x20;   alt Upload File (CV or Preview Image)

&#x20;       F->>S: Send file to storage service

&#x20;       S-->>F: Return public file URL

&#x20;       F->>B: Send file URL \& related text data

&#x20;       B->>D: Save data (users/cv\_url or projects/image\_url)

&#x20;   end

&#x20;   B-->>F: Update display success

&#x20;   F-->>V: Display Success Notification

```



\## 6. Database Schema



The database consists of three main tables: `users` for profile \& CV, `projects` for portfolio work, and `messages` for storing contact data from visitors.



\*\*`users` Table (Admin)\*\*



\- `id` (String, Primary Key): Unique user ID.

\- `email` (String): Login email.

\- `name` (String): Owner's name.

\- `cv\_url` (String): CDN link to the PDF CV file.

\- `socials` (JSON/String): Structured data or JSON string containing social media links (linkedin, github, etc.) for admin management.



\*\*`projects` Table (Projects)\*\*



\- `id` (String, Primary Key): Unique project ID.

\- `user\_id` (String, Foreign Key): Relation to the `users` table.

\- `title` (String): Project Title.

\- `link\_url` (String): Destination project URL.

\- `image\_url` (String): Project thumbnail/preview image URL.

\- `tech\_stack` (String/Text): List of technologies used (JSON Array or comma-separated String format).

\- `created\_at` (Timestamp): Creation time.



\*\*`messages` Table (Contact Messages)\*\*



\- `id` (String, Primary Key): Unique message ID.

\- `name` (String): Sender's name.

\- `email` (String): Sender's email.

\- `subject` (String): Message subject.

\- `message` (Text): Message content.

\- `created\_at` (Timestamp): Message received time.



```mermaid

erDiagram

&#x20;   USERS ||--o{ PROJECTS : "owns \& manages"

&#x20;   USERS ||--o{ MESSAGES : "receives contact" : "as subject"



&#x20;   USERS {

&#x20;       string id PK

&#x20;       string email

&#x20;       string name

&#x20;       string cv\_url

&#x20;       json socials

&#x20;   }



&#x20;   PROJECTS {

&#x20;       string id PK

&#x20;       string user\_id FK

&#x20;       string title

&#x20;       string link\_url

&#x20;       string image\_url

&#x20;       string tech\_stack

&#x20;       timestamp created\_at

&#x20;   }



&#x20;   MESSAGES {

&#x20;       string id PK

&#x20;       string name

&#x20;       string email

&#x20;       string subject

&#x20;       text message

&#x20;       timestamp created\_at

&#x20;   }

```



\## 7. Tech Stack



Recommended technologies to ensure performance, development ease, and integration of new features:



\- \*\*Frontend:\*\* Next.js (App Router) — High performance and modern routing.

\- \*\*Styling:\*\* Tailwind CSS \& shadcn/ui — Professional component library for forms, toast notifications, and neat project grid layouts.

\- \*\*Styling \& Animation (Optional):\*\* Framer Motion — For smooth transitions when project cards appear or when the form opens.

\- \*\*Backend:\*\* Next.js Server Actions / API Routes — Handles contact form submission logic and file uploads without a separate server.

\- \*\*Database:\*\* SQLite — Concise and fast for initial scale.

\- \*\*ORM:\*\* Drizzle ORM — Type-safe and lightweight.

\- \*\*Authentication:\*\* Better Auth — For securing Admin Dashboard access.

\- \*\*Storage:\*\* Uploadthing / Vercel Blob — Securely handles CV and Project Preview Image uploads.

\- \*\*Form Handling:\*\* `react-hook-form` + `zod` — Efficient client and server-side validation for contact and project addition forms.

\- \*\*Contact Notifications:\*\* `resend` or `nodemailer` — Service to send email notifications to the owner whenever a visitor submits the contact form, plus archiving messages in the database.

\- \*\*Deployment:\*\* Vercel.



