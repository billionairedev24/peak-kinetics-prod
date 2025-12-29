# Spring Boot Backend API Documentation

This document outlines all the REST API endpoints required for the Peak Kinetics Physical Therapy application to integrate with your Spring Boot backend.

## Base Configuration

**Base URL:** `http://localhost:8080/api` (configurable via `NEXT_PUBLIC_API_BASE_URL`)

**Authentication:** Most admin endpoints require Bearer token authentication.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}  // For protected routes
```

---

## 1. Authentication APIs

### 1.1 Admin Login
**Endpoint:** `POST /admin/auth/login`

**Description:** Authenticates an admin user and returns a JWT token.

**Request Body:**
```json
{
  "email": "admin@peakkinetics.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-001",
    "email": "admin@peakkinetics.com",
    "name": "Sarah Johnson",
    "role": "Administrator",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

### 1.2 Admin Registration
**Endpoint:** `POST /admin/auth/register`

**Description:** Registers a new admin user.

**Request Body:**
```json
{
  "title": "Dr.",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@peakkinetics.com",
  "password": "SecurePass123!@#"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Must meet at least 4 out of 5 requirements

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "id": "admin-123",
    "email": "john.smith@peakkinetics.com",
    "name": "Dr. John Smith"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

**Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "error": "Password does not meet security requirements"
}
```

### 1.3 Forgot Password
**Endpoint:** `POST /admin/auth/forgot-password`

**Description:** Sends a password reset link to the admin's email.

**Request Body:**
```json
{
  "email": "admin@peakkinetics.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset instructions sent to your email"
}
```

**Implementation Notes:**
- Generate a secure token (UUID or JWT with 1-hour expiration)
- Store token in database with user ID and expiration timestamp
- Send email with reset link: `https://peakkinetics.com/admin/reset-password?token={token}`
- Return success even if email doesn't exist (security best practice)

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid email format"
}
```

### 1.4 Reset Password
**Endpoint:** `POST /admin/auth/reset-password`

**Description:** Resets the admin's password using a valid reset token.

**Request Body:**
```json
{
  "token": "abc123-reset-token-xyz789",
  "newPassword": "NewSecurePass123!@#"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid or expired reset token"
}
```

**Implementation Notes:**
- Verify token exists and hasn't expired
- Hash new password with BCrypt (cost factor 10-12)
- Invalidate the reset token after use
- Optionally send confirmation email

### 1.5 Admin Logout
**Endpoint:** `POST /admin/auth/logout`

**Description:** Invalidates the admin's session token.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 1.6 Verify Token
**Endpoint:** `GET /admin/auth/verify`

**Description:** Verifies if the current token is valid.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": "admin-001",
    "email": "admin@peakkinetics.com",
    "name": "Sarah Johnson",
    "role": "Administrator"
  }
}
```

---

## 2. Reviews APIs

### 2.1 Get All Reviews
**Endpoint:** `GET /reviews`

**Description:** Retrieves all published reviews (public endpoint).

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Number of reviews per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "review-001",
      "name": "John Smith",
      "rating": 5,
      "text": "Outstanding care! The team at Peak Kinetics helped me recover from a sports injury quickly and effectively.",
      "date": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 156,
  "page": 0,
  "pageSize": 20
}
```

### 2.2 Create Review
**Endpoint:** `POST /reviews`

**Description:** Creates a new review (public endpoint for customer submissions).

**Request Body:**
```json
{
  "name": "John Smith",
  "rating": 5,
  "text": "Great experience with the therapy team. Very professional and knowledgeable."
}
```

**Validation Rules:**
- `name` (required): 2-100 characters, alphabetic characters and spaces only
- `rating` (required): Integer between 1 and 5
- `text` (required): 20-1000 characters

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Thank you for your review!",
  "data": {
    "id": "review-123",
    "name": "John Smith",
    "rating": 5,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Name, rating, and review text are required",
  "validationErrors": {
    "name": "Name must be between 2 and 100 characters",
    "rating": "Rating must be between 1 and 5",
    "text": "Review must be at least 20 characters"
  }
}
```

### 2.3 Get Single Review (Admin)
**Endpoint:** `GET /reviews/{reviewId}`

**Description:** Retrieves a single review by ID.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "id": "review-001",
  "name": "John Smith",
  "rating": 5,
  "text": "Outstanding care!",
  "fullText": "Outstanding care! The team at Peak Kinetics...",
  "date": "Jan 15, 2024",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 2.4 Delete Review (Admin)
**Endpoint:** `DELETE /reviews/{reviewId}`

**Description:** Deletes a review.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

### 2.5 Send Review Request (Admin)
**Endpoint:** `POST /admin/reviews/send-request`

**Description:** Sends a review request email/SMS to a client.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "clientName": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "+17373682653"
}
```

**Validation Rules:**
- `clientName` (required): 2-200 characters
- `email` (optional): Valid email format if provided
- `phone` (optional): Valid E.164 phone format if provided
- At least one of `email` or `phone` must be provided

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Review request sent successfully to Jane Doe",
  "sentVia": ["email"],
  "reviewUrl": "https://peakkinetics.com/review"
}
```

### 2.6 Import Reviews from CSV (Admin)
**Endpoint:** `POST /admin/reviews/import`

**Description:** Imports reviews from a CSV file with healthcare survey data.

**Headers:** 
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
file: [CSV File]
```

**CSV Format Expected:**
The CSV should have these headers (Healthcare Survey Export):
- Patient First Name
- Patient Last Name
- Comments
- Survey Completion Date

**The backend should extract:**
- `Patient First Name` + `Patient Last Name` → `name`
- `Comments` → `text`
- `Survey Completion Date` → `date`
- Default rating to 5 stars (or parse from NPS if available)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully imported 45 reviews",
  "imported": 45,
  "skipped": 3,
  "errors": [
    {
      "row": 12,
      "reason": "Missing required fields (name or comments)"
    }
  ]
}
```

---

## 3. Messages APIs

### 3.1 Create Message
**Endpoint:** `POST /messages`

**Description:** Creates a new contact message (public endpoint).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+17373682653",
  "address": "123 Main St, Round Rock, TX 78681",
  "message": "I would like to schedule an appointment for sports injury rehabilitation."
}
```

**Validation Rules:**
- `email` (required): Must be valid email format (RFC 5322)
- `message` (required): Minimum 10 characters, maximum 2000 characters
- `firstName` (optional): 1-100 characters if provided
- `lastName` (optional): 1-100 characters if provided
- `phone` (optional): Valid E.164 format if provided (e.g., +17373682653)
- `address` (optional): Maximum 500 characters if provided

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message sent successfully! We'll respond within 2 hours.",
  "data": {
    "id": "msg-123",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Email and message are required"
}
```

### 3.2 Get All Messages (Admin)
**Endpoint:** `GET /admin/messages`

**Description:** Retrieves all contact messages.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by read status (`read`, `unread`, `all`)
- `limit` (optional): Number of messages to return
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg-001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-737-368-2653",
      "address": "123 Main St, Round Rock, TX 78681",
      "message": "I would like to schedule an appointment for sports injury rehabilitation...",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 24,
  "unread": 8
}
```

### 3.3 Mark Message as Read (Admin)
**Endpoint:** `PATCH /admin/messages/{messageId}/read`

**Description:** Marks a message as read.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

### 3.4 Delete Message (Admin)
**Endpoint:** `DELETE /admin/messages/{messageId}`

**Description:** Deletes a message.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## 4. Blog APIs

### 4.1 Get All Blog Posts
**Endpoint:** `GET /blog`

**Description:** Retrieves blog posts (public for published, admin for all).

**Query Parameters:**
- `status` (optional): Filter by status (`published`, `draft`, `all`)
- `slug` (optional): Get post by slug
- `limit` (optional): Number of posts to return
- `offset` (optional): Pagination offset
- `tags` (optional): Comma-separated list of tags to filter by

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "post-001",
      "title": "5 Exercises for Lower Back Pain Relief",
      "slug": "5-exercises-lower-back-pain",
      "excerpt": "Discover effective exercises for lower back pain and improve mobility.",
      "content": "# Introduction\n\nLower back pain affects millions...",
      "featuredImage": "https://storage.example.com/blog/lower-back-exercises.jpg",
      "status": "published",
      "tags": ["back pain", "exercises", "wellness"],
      "author": {
        "id": "admin-001",
        "name": "Sarah Johnson"
      },
      "publishedAt": "2024-01-15T10:00:00Z",
      "createdAt": "2024-01-14T15:30:00Z",
      "updatedAt": "2024-01-15T09:45:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 10
}
```

### 4.2 Get Single Blog Post
**Endpoint:** `GET /blog/{postId}` or `GET /blog?slug={slug}`

**Description:** Retrieves a single blog post by ID or slug.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "post-001",
    "title": "5 Exercises for Lower Back Pain Relief",
    "slug": "5-exercises-lower-back-pain",
    "excerpt": "Discover effective exercises...",
    "content": "# Introduction\n\nLower back pain...",
    "featuredImage": "https://storage.example.com/blog/image.jpg",
    "status": "published",
    "tags": ["back pain", "exercises"],
    "publishedAt": "2024-01-15T10:00:00Z"
  }
}
```

### 4.3 Create Blog Post (Admin)
**Endpoint:** `POST /admin/blog`

**Description:** Creates a new blog post.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "5 Exercises for Lower Back Pain Relief",
  "slug": "5-exercises-lower-back-pain",
  "excerpt": "Discover effective exercises to alleviate lower back pain.",
  "content": "# Introduction\n\nLower back pain affects millions of people...",
  "featuredImage": "https://storage.example.com/blog/image.jpg",
  "status": "published",
  "tags": ["back pain", "exercises", "wellness"]
}
```

**Validation Rules:**
- `title` (required): 5-200 characters
- `slug` (required): Unique, URL-friendly string (lowercase, hyphens, no spaces)
- `content` (required): Minimum 100 characters
- `excerpt` (optional): Maximum 300 characters, auto-generated from content if not provided
- `status` (required): Either "published" or "draft"
- `tags` (optional): Array of strings, each 2-50 characters, maximum 10 tags
- `featuredImage` (optional): Valid URL format

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "data": {
    "id": "post-123",
    "title": "5 Exercises for Lower Back Pain Relief",
    "slug": "5-exercises-lower-back-pain",
    "status": "published",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Slug already exists"
}
```

### 4.4 Update Blog Post (Admin)
**Endpoint:** `PUT /admin/blog/{postId}`

**Description:** Updates an existing blog post.

**Headers:** `Authorization: Bearer {token}`

**Request Body:** Same as Create Blog Post

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Blog post updated successfully",
  "data": {
    "id": "post-001",
    "title": "5 Exercises for Lower Back Pain Relief",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

### 4.5 Delete Blog Post (Admin)
**Endpoint:** `DELETE /admin/blog/{postId}`

**Description:** Deletes a blog post.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Blog post deleted successfully"
}
```

### 4.6 Upload Blog Image (Admin)
**Endpoint:** `POST /admin/blog/upload`

**Description:** Uploads an image for blog posts.

**Headers:** 
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
image: [Image File]
```

**Accepted Formats:** JPG, PNG, WebP, GIF
**Max Size:** 5MB

**Response (200 OK):**
```json
{
  "success": true,
  "url": "https://storage.example.com/blog/images/abc123.jpg",
  "filename": "abc123.jpg",
  "size": 245678,
  "contentType": "image/jpeg"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "File size exceeds 5MB limit"
}
```

---

## 5. Error Handling

All API endpoints should follow consistent error response formats:

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate slug)
- `422 Unprocessable Entity`: Validation failed
- `500 Internal Server Error`: Server error

---

## 6. Security Considerations

### Authentication
- Use JWT tokens with expiration (recommended: 24 hours)
- Refresh tokens should be implemented for long sessions
- Store tokens securely (HttpOnly cookies for production)

### Authorization
- All `/admin/*` endpoints require authentication
- Validate user roles before allowing access
- Implement rate limiting on public endpoints

### Data Validation
- Sanitize all user inputs to prevent XSS attacks
- Validate email formats, phone numbers, and URLs
- Limit request payload sizes
- Implement CSRF protection

### CORS Configuration
In development, allow:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

In production:
```
Access-Control-Allow-Origin: https://peakkinetics.com
```

---

## 7. Database Schema Recommendations

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(10) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Administrator',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Blog Posts Table
```sql
CREATE TABLE blog_posts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  author_id VARCHAR(36),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES admin_users(id)
);
```

### Blog Tags Table (Many-to-Many)
```sql
CREATE TABLE blog_tags (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_post_tags (
  post_id VARCHAR(36),
  tag_id VARCHAR(36),
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
);
```

---

## 8. Testing the APIs

### Using cURL

**Test Authentication:**
```bash
curl -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@peakkinetics.com","password":"admin123"}'
```

**Test Create Review:**
```bash
curl -X POST http://localhost:8080/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","rating":5,"text":"Great service! Highly recommend."}'
```

**Test Get Reviews:**
```bash
curl http://localhost:8080/api/reviews
```

**Test Admin Endpoint:**
```bash
curl -X GET http://localhost:8080/api/admin/messages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 9. Frontend Configuration

The frontend uses environment variables for API configuration:

**.env.local file:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_DEV_MODE=false
```

**Development Mode:**
- Set `NEXT_PUBLIC_DEV_MODE=true` to use mock data (no backend required)
- Set `NEXT_PUBLIC_DEV_MODE=false` to connect to Spring Boot backend

---

## 10. Deployment & Bundling Architecture

### Overview

This Next.js application is designed to be **bundled with a Spring Boot backend** as a unified deployment. The architecture works as follows:

```
┌─────────────────────────────────────────────────────────┐
│                   Spring Boot Application               │
│                                                         │
│  ┌────────────────────┐      ┌────────────────────┐  │
│  │   Static Frontend  │      │   REST API Backend │  │
│  │   (Next.js Build)  │◄────►│   (Spring MVC)     │  │
│  │                    │      │                    │  │
│  │  /index.html       │      │  /api/**           │  │
│  │  /assets/**        │      │                    │  │
│  │  /_next/**         │      │                    │  │
│  └────────────────────┘      └────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### How It Works

1. **Frontend Build Process:**
   - Next.js builds the application into static files
   - All JavaScript, CSS, images, and HTML are generated in the `.next` directory
   - The build is optimized for production with code splitting and minification

2. **Spring Boot Integration:**
   - Spring Boot serves the Next.js static files from its `resources/static` directory
   - Spring Boot handles all API requests at `/api/**` endpoints
   - All other routes are handled by Next.js (client-side routing)

3. **Routing Strategy:**
   ```
   Request Pattern                Spring Boot Action
   ─────────────────────────────────────────────────────
   /                              → Serve index.html (Next.js)
   /about, /services, etc.        → Serve index.html (client routing)
   /admin/dashboard               → Serve index.html (client routing)
   /api/reviews                   → Handle with REST Controller
   /api/admin/auth/login          → Handle with REST Controller
   /_next/static/**               → Serve static assets
   /images/**                     → Serve static assets
   ```

### Deployment Steps

#### Step 1: Build the Next.js Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# This creates an optimized production build in the .next directory
# and exports static files to the 'out' directory
```

#### Step 2: Copy Build to Spring Boot

After building, copy the Next.js output to your Spring Boot project:

```bash
# Copy the entire Next.js build output
cp -r .next/static ./spring-boot-app/src/main/resources/static/_next/static/
cp -r public/* ./spring-boot-app/src/main/resources/static/
cp -r out/* ./spring-boot-app/src/main/resources/static/

# Or use the provided script (create this in your project)
./deploy-to-spring-boot.sh
```

**Deployment Script (deploy-to-spring-boot.sh):**
```bash
#!/bin/bash

# Build Next.js
echo "Building Next.js application..."
npm run build

# Define Spring Boot static resources path
SPRING_STATIC="./spring-boot-app/src/main/resources/static"

# Clear previous build
echo "Cleaning previous build..."
rm -rf $SPRING_STATIC/*

# Copy static assets
echo "Copying static assets..."
cp -r public/* $SPRING_STATIC/
cp -r .next/static $SPRING_STATIC/_next/

# Copy HTML files
echo "Copying HTML files..."
find .next/server/pages -name "*.html" -exec cp {} $SPRING_STATIC/ \;

echo "Deployment to Spring Boot complete!"
```

#### Step 3: Configure Spring Boot

**Application Configuration (application.yml):**
```yaml
spring:
  web:
    resources:
      static-locations: classpath:/static/
  mvc:
    static-path-pattern: /**

server:
  port: 8080
  
# CORS Configuration
cors:
  allowed-origins: 
    - http://localhost:3000  # Development
    - https://peakkinetics.com  # Production
  allowed-methods: GET,POST,PUT,DELETE,PATCH
  allowed-headers: "*"
  allow-credentials: true
```

**WebMvcConfigurer (Java Configuration):**
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve Next.js static files
        registry.addResourceHandler("/_next/**")
                .addResourceLocations("classpath:/static/_next/");
        
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
        
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "https://peakkinetics.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

**Controller for Frontend Routing:**
```java
@Controller
public class FrontendController {
    
    // Forward all non-API routes to index.html for Next.js client-side routing
    @GetMapping(value = {"/{path:[^\\.]*}", "/**/{path:[^\\.]*}"})
    public String forward(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // Don't forward API requests
        if (path.startsWith("/api/")) {
            return null;
        }
        
        // Don't forward static resources
        if (path.startsWith("/_next/") || 
            path.startsWith("/images/") || 
            path.contains(".")) {
            return null;
        }
        
        // Forward to index.html for client-side routing
        return "forward:/index.html";
    }
}
```

#### Step 4: Build Spring Boot Application

```bash
cd spring-boot-app

# Build with Maven
./mvnw clean package

# Or with Gradle
./gradlew build

# The resulting JAR will contain both frontend and backend
# Located at: target/peak-kinetics-0.0.1-SNAPSHOT.jar
```

#### Step 5: Run the Application

```bash
# Run the Spring Boot JAR
java -jar target/peak-kinetics-0.0.1-SNAPSHOT.jar

# Application will be available at:
# - Frontend: http://localhost:8080
# - API: http://localhost:8080/api
```

### Environment Variables

**For Development (Next.js only):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_DEV_MODE=true
```

**For Production (Bundled with Spring Boot):**
```env
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_DEV_MODE=false
```

Note: When bundled, the API base URL can be relative (`/api`) since both frontend and backend are served from the same domain.

### Production Deployment Options

#### Option 1: Single JAR Deployment
```bash
# Build the fat JAR with embedded Tomcat
./mvnw clean package

# Deploy to server
scp target/peak-kinetics.jar user@server:/opt/apps/

# Run on server
ssh user@server
cd /opt/apps
java -jar peak-kinetics.jar
```

#### Option 2: Docker Container
```dockerfile
# Dockerfile
FROM openjdk:17-slim

WORKDIR /app

# Copy the Spring Boot JAR (which includes Next.js build)
COPY target/peak-kinetics-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
# Build Docker image
docker build -t peak-kinetics:latest .

# Run container
docker run -p 8080:8080 peak-kinetics:latest
```

#### Option 3: Cloud Deployment (AWS, Azure, GCP)
The bundled JAR can be deployed to:
- AWS Elastic Beanstalk
- Azure App Service
- Google Cloud Run
- Heroku
- Any VM or container service

### Benefits of Bundling

1. **Single Deployment Unit:** One JAR file contains everything
2. **No CORS Issues:** Frontend and backend on same origin
3. **Simplified DevOps:** One application to deploy and monitor
4. **Performance:** Direct communication without network overhead
5. **Cost-Effective:** Single server/container instead of multiple
6. **Easy Rollback:** Single artifact to version and revert

### Development Workflow

For development, you can run them separately:

**Terminal 1 - Next.js Dev Server:**
```bash
npm run dev
# Runs on http://localhost:3000
# Uses NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

**Terminal 2 - Spring Boot:**
```bash
cd spring-boot-app
./mvnw spring-boot:run
# Runs on http://localhost:8080
# Serves API at /api/**
```

For production, bundle them together as described above.

---

## 11. API Response Caching

Consider implementing caching for frequently accessed endpoints:

**Spring Boot Caching Configuration:**
```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("reviews", "blogPosts");
    }
}
```

**Using Cache in Controllers:**
```java
@GetMapping("/reviews")
@Cacheable("reviews")
public ResponseEntity<List<Review>> getReviews() {
    // This response will be cached
    return ResponseEntity.ok(reviewService.getAllReviews());
}

@PostMapping("/reviews")
@CacheEvict(value = "reviews", allEntries = true)
public ResponseEntity<Review> createReview(@RequestBody Review review) {
    // This will clear the cache
    return ResponseEntity.ok(reviewService.create(review));
}
```

---

## 12. Monitoring & Logging

### Recommended Logging Configuration

**logback-spring.xml:**
```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <logger name="com.peakkinetics.api" level="INFO"/>
    <logger name="org.springframework.web" level="INFO"/>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

### Request Logging Interceptor

```java
@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingInterceptor.class);
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        logger.info("[{}] {} - {}", request.getMethod(), request.getRequestURI(), request.getRemoteAddr());
        return true;
    }
}
```

---

## 13. Health Check Endpoint

Implement a health check for monitoring:

```java
@RestController
@RequestMapping("/api/health")
public class HealthController {
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", Instant.now());
        health.put("service", "Peak Kinetics API");
        health.put("version", "1.0.0");
        
        return ResponseEntity.ok(health);
    }
}
```

**Frontend can check:**
```typescript
const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('Backend status:', data.status);
  } catch (error) {
    console.error('Backend is down');
  }
};
```

---

## 14. Java Entity Classes and DTOs

### Review Entity

```java
package com.peakkinetics.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreatedDate;
import org.hibernate.annotations.UpdatedDate;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_rating", columnList = "rating"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    
    @Id
    @Column(length = 36)
    private String id = UUID.randomUUID().toString();
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Name must contain only letters and spaces")
    @Column(nullable = false, length = 100)
    private String name;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    @Column(nullable = false)
    private Integer rating;
    
    @NotBlank(message = "Review text is required")
    @Size(min = 20, max = 1000, message = "Review must be between 20 and 1000 characters")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @UpdatedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Review DTO (Data Transfer Object)

```java
package com.peakkinetics.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Name must contain only letters and spaces")
    private String name;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private Integer rating;
    
    @NotBlank(message = "Review text is required")
    @Size(min = 20, max = 1000, message = "Review must be between 20 and 1000 characters")
    private String text;
}
```

### Admin User Entity

```java
package com.peakkinetics.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreatedDate;
import org.hibernate.annotations.UpdatedDate;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_users", indexes = {
    @Index(name = "idx_email", columnList = "email", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUser {
    
    @Id
    @Column(length = 36)
    private String id = UUID.randomUUID().toString();
    
    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 10)
    private String title; // Dr., Mr., Mrs., Ms.
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
    
    @Column(length = 50)
    private String role = "Administrator";
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @UpdatedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Helper method to get full name
    public String getFullName() {
        return title + " " + firstName + " " + lastName;
    }
    
    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Admin Registration DTO

```java
package com.peakkinetics.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminRegistrationDTO {
    
    @NotBlank(message = "Title is required")
    @Pattern(regexp = "^(Dr\\.|Mr\\.|Mrs\\.|Ms\\.)$", message = "Title must be Dr., Mr., Mrs., or Ms.")
    private String title;
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    private String password;
}
```

### Message Entity

```java
package com.peakkinetics.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreatedDate;
import org.hibernate.annotations.UpdatedDate;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_read", columnList = "read"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    @Id
    @Column(length = 36)
    private String id = UUID.randomUUID().toString();
    
    @Size(max = 100, message = "First name must not exceed 100 characters")
    @Column(name = "first_name", length = 100)
    private String firstName;
    
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    @Column(name = "last_name", length = 100)
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(nullable = false, length = 255)
    private String email;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone must be in valid E.164 format")
    @Column(length = 20)
    private String phone;
    
    @Size(max = 500, message = "Address must not exceed 500 characters")
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @NotBlank(message = "Message is required")
    @Size(min = 10, max = 2000, message = "Message must be between 10 and 2000 characters")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "read", nullable = false)
    private Boolean read = false;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @UpdatedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (read == null) {
            read = false;
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Message DTO

```java
package com.peakkinetics.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;
    
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone must be in valid E.164 format")
    private String phone;
    
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;
    
    @NotBlank(message = "Message is required")
    @Size(min = 10, max = 2000, message = "Message must be between 10 and 2000 characters")
    private String message;
}
```

### Blog Post Entity

```java
package com.peakkinetics.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreatedDate;
import org.hibernate.annotations.UpdatedDate;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "blog_posts", indexes = {
    @Index(name = "idx_slug", columnList = "slug", unique = true),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_published_at", columnList = "published_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogPost {
    
    @Id
    @Column(length = 36)
    private String id = UUID.randomUUID().toString();
    
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    @Column(nullable = false, length = 200)
    private String title;
    
    @NotBlank(message = "Slug is required")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must be URL-friendly (lowercase, hyphens only)")
    @Column(nullable = false, unique = true, length = 255)
    private String slug;
    
    @Size(max = 300, message = "Excerpt must not exceed 300 characters")
    @Column(columnDefinition = "TEXT")
    private String excerpt;
    
    @NotBlank(message = "Content is required")
    @Size(min = 100, message = "Content must be at least 100 characters")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "featured_image", length = 500)
    private String featuredImage;
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(published|draft)$", message = "Status must be 'published' or 'draft'")
    @Column(nullable = false, length = 20)
    private String status = "draft";
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private AdminUser author;
    
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "blog_post_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<BlogTag> tags = new HashSet<>();
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @UpdatedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        if ("published".equals(status) && publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        
        if ("published".equals(status) && publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }
    }
}
```

### Blog Tag Entity

```java
package com.peakkinetics.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreatedDate;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "blog_tags", indexes = {
    @Index(name = "idx_tag_name", columnList = "name", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogTag {
    
    @Id
    @Column(length = 36)
    private String id = UUID.randomUUID().toString();
    
    @NotBlank(message = "Tag name is required")
    @Size(min = 2, max = 50, message = "Tag name must be between 2 and 50 characters")
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    @ManyToMany(mappedBy = "tags")
    private Set<BlogPost> posts = new HashSet<>();
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
    }
}
```

### Blog Post DTO

```java
package com.peakkinetics.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogPostDTO {
    
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;
    
    @NotBlank(message = "Slug is required")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must be URL-friendly")
    private String slug;
    
    @Size(max = 300, message = "Excerpt must not exceed 300 characters")
    private String excerpt;
    
    @NotBlank(message = "Content is required")
    @Size(min = 100, message = "Content must be at least 100 characters")
    private String content;
    
    private String featuredImage;
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(published|draft)$", message = "Status must be 'published' or 'draft'")
    private String status;
    
    @Size(max = 10, message = "Maximum 10 tags allowed")
    private List<String> tags;
}
```

### Global Exception Handler

```java
package com.peakkinetics.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);
        });
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Validation failed");
        response.put("validationErrors", validationErrors);
        response.put("timestamp", Instant.now());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(
            ConstraintViolationException ex) {
        
        Map<String, String> validationErrors = new HashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            validationErrors.put(fieldName, errorMessage);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "Validation failed");
        response.put("validationErrors", validationErrors);
        response.put("timestamp", Instant.now());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "An unexpected error occurred");
        response.put("message", ex.getMessage());
        response.put("timestamp", Instant.now());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

### API Response Wrapper

```java
package com.peakkinetics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
```

---

## Summary

This API documentation provides all the endpoints needed to integrate the Peak Kinetics Next.js frontend with your Spring Boot backend. The bundled architecture allows you to deploy both as a single application, simplifying deployment and improving performance. Follow the deployment steps above to create a production-ready JAR file that serves both the frontend and API from a single server.
