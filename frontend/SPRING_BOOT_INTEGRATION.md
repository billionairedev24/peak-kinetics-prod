# Spring Boot Integration Guide

This Next.js application is configured for **static export** (no SSR) and is designed to be integrated with a Spring Boot backend.

## Configuration

### 1. Next.js Configuration

The `next.config.mjs` is already configured with:
- `output: 'export'` - Generates static HTML/CSS/JS files
- `images.unoptimized: true` - No server-side image optimization
- No server-side rendering or API routes in production

### 2. Build the Static Files

```bash
npm install
npm run build
```

This creates a static site in the `out/` directory.

### 3. Spring Boot Integration

#### Option A: Serve from Spring Boot Static Resources

1. Copy the `out/` directory contents to `src/main/resources/static/` in your Spring Boot project:

```bash
cp -r out/* /path/to/springboot/src/main/resources/static/
```

2. Spring Boot will automatically serve these files at the root path.

#### Option B: Serve from a Sub-path

If you want to serve the frontend at `/app`:

1. Update `next.config.mjs`:
```javascript
const nextConfig = {
  output: 'export',
  basePath: '/app',
  // ... rest of config
}
```

2. Rebuild and copy to Spring Boot:
```bash
npm run build
cp -r out/* /path/to/springboot/src/main/resources/static/app/
```

### 4. Backend API Endpoints

Configure your Spring Boot backend URL by setting the environment variable:

```bash
# Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Production
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api
```

Or create a `.env.local` file:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 5. Required Spring Boot API Endpoints

Implement these REST endpoints in your Spring Boot application:

#### Reviews API

**GET /api/reviews**
- Returns list of all reviews
- Response format:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "role": "Patient",
      "text": "Great service!",
      "fullText": "Extended review text...",
      "rating": 5,
      "treatment": "Back Pain",
      "image": "/images/avatar.jpg",
      "date": "January 1, 2024"
    }
  ],
  "count": 1
}
```

**POST /api/reviews**
- Creates a new review
- Request body:
```json
{
  "name": "John Doe",
  "role": "Patient",
  "text": "Great service!",
  "fullText": "Extended review text...",
  "rating": 5,
  "treatment": "Back Pain",
  "image": "/images/avatar.jpg"
}
```
- Response:
```json
{
  "success": true,
  "data": { /* review object */ },
  "message": "Review submitted successfully!"
}
```

#### Messages API

**POST /api/messages**
- Creates a new contact message
- Request body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "address": "123 Main St",
  "message": "I need help with..."
}
```
- Required fields: `email`, `message`
- Optional fields: `firstName`, `lastName`, `phone`, `address`
- Response:
```json
{
  "success": true,
  "data": { /* message object */ },
  "message": "Message sent successfully!"
}
```

### 6. CORS Configuration

Add CORS configuration to your Spring Boot application:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }
}
```

### 7. Example Spring Boot Controller

```java
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;
    
    @GetMapping
    public ResponseEntity<?> getAllReviews() {
        List<Review> reviews = reviewService.findAll();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", reviews,
            "count", reviews.size()
        ));
    }
    
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewDTO reviewDTO) {
        try {
            Review review = reviewService.save(reviewDTO);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", review,
                "message", "Review submitted successfully!"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to create review"
            ));
        }
    }
}
```

### 8. Development Workflow

During development, run both servers:

1. **Spring Boot Backend** (port 8080):
```bash
mvn spring-boot:run
```

2. **Next.js Frontend** (port 3000):
```bash
npm run dev
```

3. Set API URL in `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 9. Production Deployment

1. Build the static site:
```bash
npm run build
```

2. Copy `out/` to Spring Boot:
```bash
cp -r out/* /path/to/springboot/src/main/resources/static/
```

3. Build Spring Boot JAR:
```bash
mvn clean package
```

4. Deploy the Spring Boot JAR with embedded static frontend.

### 10. Environment Variables

The frontend uses one environment variable:
- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL (default: `http://localhost:8080/api`)

Set this during build time or use the default value for production.

## Notes

- The Next.js API routes in `app/api/` are for **local development only** and won't work in production export
- All API calls go directly to the Spring Boot backend in production
- The static export means no server-side rendering - all rendering happens in the browser
- Images must be placed in the `public/` directory and will be copied to the static export
