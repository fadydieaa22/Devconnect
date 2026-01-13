# DevConnect - Developer Social Network Platform

DevConnect is a full-stack social networking platform built for developers to showcase their work, connect with peers, and build professional networks.

## 🚀 Features

### Core Social Features

- **Follow System** - Follow and unfollow other developers
- **Activity Feed** - Personalized feed showing projects from developers you follow
- **User Discovery** - Browse and discover talented developers in the community
- **Public Profiles** - Showcase your bio, skills, and projects on a public profile

### Project Management

- **Create & Share Projects** - Upload projects with descriptions, tech stack, and links
- **Project Details** - Rich project pages with images, comments, and likes
- **Comment System** - Engage with projects through comments
- **Like Projects** - Show appreciation for projects you love

### User Experience

- **Search Functionality** - Search for projects and developers
- **Real-time Notifications** - Get notified when others interact with your work
- **Toast Notifications** - User-friendly feedback for all actions
- **Loading Skeletons** - Smooth loading states while fetching data
- **Dark/Light Theme** - Toggle between dark and light modes

### Technical Features

- **JWT Authentication** - Secure token-based authentication
- **Image Upload** - Upload project images and avatars (Cloudinary integration)
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Environment Variables** - Configurable API endpoints for different environments

## 🏗️ Architecture

### Frontend (React + Vite)

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4 with CSS variables
- **Routing**: React Router v7
- **HTTP Client**: Axios with interceptors
- **State Management**: React Hooks & Context API

### Backend (Express.js + MongoDB)

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer + Cloudinary
- **Image Storage**: Local `/uploads` and Cloudinary

## 📦 Installation

### Prerequisites

- Node.js 16+
- MongoDB (local or cloud)
- Cloudinary account (optional, for image uploads)

### Server Setup

1. Navigate to the server directory:

   ```bash
   cd devconnect/server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/devconnect
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:

   ```bash
   cd devconnect/client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file from `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local`:

   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The client will be available at `http://localhost:5173`

## 🗄️ Database Models

### User

```javascript
{
  name: String (required),
  username: String (unique, lowercase),
  email: String (required, unique),
  password: String (hashed),
  bio: String,
  avatar: String (URL),
  skills: [String],
  followers: [ObjectId], // References to User
  following: [ObjectId], // References to User
  createdAt: Date,
  updatedAt: Date
}
```

### Project

```javascript
{
  title: String (required),
  description: String,
  user: ObjectId (ref: User),
  image: String (Cloudinary URL),
  techStack: [String],
  liveUrl: String,
  githubUrl: String,
  likes: [ObjectId], // User IDs
  comments: [ObjectId], // Comment IDs
  createdAt: Date,
  updatedAt: Date
}
```

### Comment

```javascript
{
  content: String (required),
  user: ObjectId (ref: User),
  project: ObjectId (ref: Project),
  createdAt: Date,
  updatedAt: Date
}
```

### Notification

```javascript
{
  recipient: ObjectId (ref: User),
  sender: ObjectId (ref: User),
  type: String (like, comment, follow),
  project: ObjectId (ref: Project),
  message: String,
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users

- `GET /api/user` - Get all public users
- `GET /api/user/me` - Get current user (protected)
- `GET /api/user/:username` - Get user by username
- `GET /api/user/search?q=query` - Search users
- `PUT /api/user/profile` - Update profile (protected)
- `POST /api/user/:userId/follow` - Follow a user (protected)
- `POST /api/user/:userId/unfollow` - Unfollow a user (protected)

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/me` - Get current user's projects (protected)
- `GET /api/projects/:id` - Get project details
- `GET /api/projects/user/:username` - Get projects by username
- `GET /api/projects/search?q=query` - Search projects
- `POST /api/projects` - Create project (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)
- `POST /api/projects/:id/like` - Like/unlike project (protected)

### Comments

- `GET /api/projects/:id/comments` - Get project comments
- `POST /api/projects/:id/comments` - Add comment (protected)
- `DELETE /api/projects/:id/comments/:commentId` - Delete comment (protected)

### Notifications

- `GET /api/notifications` - Get notifications (protected)
- `PUT /api/notifications/:id/read` - Mark as read (protected)
- `PUT /api/notifications/mark/all-as-read` - Mark all as read (protected)
- `DELETE /api/notifications/:id` - Delete notification (protected)

## 🎨 UI Components

### Toast Notifications

Real-time feedback with `useToast()` hook:

```jsx
const { showToast } = useToast();
showToast("Success message", "success");
showToast("Error message", "error");
showToast("Warning message", "warning");
```

### Loading Skeletons

Pre-built skeleton loaders:

- `CardSkeleton` - Generic card loading
- `ProfileSkeleton` - Profile page loading
- `UserListSkeleton` - User list loading
- `ProjectSkeleton` - Project card loading

### Search Bar

Global search component in navbar:

- Search projects by title/description
- Search users by name/username/bio
- Real-time results with debouncing

## 🎨 Styling

### Theme Variables

```css
--bg: #071826
--surface: #0f2430
--accent: #ff6b61
--text-primary: #e6eef7
--text-secondary: #cbd5e1
```

### Dark/Light Mode

Toggle theme in navbar. Automatically saves to localStorage.

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Protected routes on frontend and backend
- CORS enabled for cross-origin requests
- Authorization checks on all protected endpoints
- Input validation and sanitization

## 📱 Pages & Routes

### Public Routes

- `/` - Home page
- `/about` - About page
- `/projects` - Browse all projects
- `/users` - Discover developers
- `/contacts` - Contact information
- `/profile/:username` - Public developer profile
- `/project/:id` - Project details
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Logged-in Users)

- `/dashboard` - User dashboard
- `/feed` - Personalized feed
- `/edit-profile` - Edit profile
- `/project/:id/edit` - Edit project

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
npm run build
# Deploy the dist folder
```

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables on hosting platform
2. Push to git repository
3. Hosting platform automatically deploys

## 📝 Environment Variables

### Frontend (`.env.local`)

```
VITE_API_URL=http://localhost:5000/api
```

### Backend (`.env`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/devconnect
JWT_SECRET=your_secret_key
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🛠️ Future Enhancements

- [ ] Direct messaging between users
- [ ] Team collaboration features
- [ ] Project categories and advanced filtering
- [ ] User ratings and reputation system
- [ ] Email notifications
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Rate limiting
- [ ] Database indexing for performance
- [ ] Unit and integration tests
- [ ] API documentation (Swagger)

## 📄 License

MIT License - feel free to use this project!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ for developers, by developers**
