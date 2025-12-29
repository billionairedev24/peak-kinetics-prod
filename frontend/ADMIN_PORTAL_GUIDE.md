# Admin Portal Guide

## Quick Start (Development Mode)

The admin portal is currently in **development mode** which allows you to test all features without a backend.

### Login Credentials (Development)
- **Email:** admin@peakkinetics.com
- **Password:** admin123

### Accessing the Admin Portal

1. Navigate to `/admin/login`
2. Enter the development credentials above
3. You'll be redirected to the admin dashboard

## Admin Features

### 1. Dashboard (`/admin/dashboard`)
- Overview of practice statistics
- Quick access to key features
- Activity metrics

### 2. Review Management (`/admin/reviews`)
- **Send Review Requests:** Send personalized email/SMS requests to clients
- **Import Reviews:** Bulk upload reviews via CSV file
- CSV Format:
  ```csv
  name,email,rating,review,date
  John Doe,john@example.com,5,"Great service!",2024-01-15
  ```

### 3. Message Management (`/admin/messages`)
- View all messages from clients
- Filter by read/unread status
- Search messages
- Quick actions (email reply, phone call)

### 4. Blog Management (`/admin/blog`)
- Create new blog posts with rich text editor
- Add images and videos
- Manage drafts and published posts
- Edit and delete existing posts

## Switching to Production Mode

When your Spring Boot backend is ready:

1. Update `.env.local`:
   ```env
   NEXT_PUBLIC_DEV_MODE=false
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
   ```

2. Implement the following Spring Boot endpoints:

### Required Spring Boot API Endpoints

#### Authentication
- `POST /api/admin/auth/login`
  - Body: `{ email: string, password: string }`
  - Response: `{ token: string, user: { id, email, name } }`

#### Reviews
- `GET /api/reviews` - List all reviews
- `POST /api/reviews` - Create review
- `POST /api/admin/reviews/import` - Import CSV
  - Body: `FormData` with CSV file
- `POST /api/admin/reviews/send-request` - Send review request
  - Body: `{ name, email, phone }`

#### Messages
- `GET /api/admin/messages` - List all messages
- `POST /api/messages` - Create message (from contact form)

#### Blog
- `GET /api/blog` - List blog posts
- `GET /api/blog/:slug` - Get single post
- `POST /api/admin/blog` - Create post
- `PUT /api/admin/blog/:id` - Update post
- `DELETE /api/admin/blog/:id` - Delete post
- `POST /api/admin/blog/upload` - Upload media
  - Body: `FormData` with image/video file

## Security Notes

- Development mode credentials are for testing only
- Remove or disable development mode in production
- Implement proper JWT authentication in Spring Boot
- Use HTTPS for all API communication
- Store sensitive data securely

## File Structure

```
app/
├── admin/
│   ├── login/page.tsx          # Login page
│   ├── dashboard/page.tsx      # Main dashboard
│   ├── reviews/page.tsx        # Review management
│   ├── messages/page.tsx       # Message management
│   └── blog/
│       ├── page.tsx            # Blog list
│       ├── new/page.tsx        # Create post
│       └── edit/[id]/page.tsx  # Edit post
├── blog/
│   ├── page.tsx                # Customer blog list
│   └── [slug]/page.tsx         # Customer blog post
components/
└── admin/
    ├── admin-layout.tsx        # Admin layout wrapper
    └── blog-editor.tsx         # Rich text editor
lib/
├── admin-auth.ts               # Authentication logic
└── api-config.ts               # API endpoint configuration
