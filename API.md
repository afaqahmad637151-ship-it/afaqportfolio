# API Documentation

## Authentication

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  },
  "token": "string"
}
```

### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  },
  "token": "string"
}
```

## Posts

### GET /api/posts
Get all posts.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "number",
      "title": "string",
      "content": "string",
      "user_id": "number",
      "created_at": "string"
    }
  ]
}
```

### POST /api/posts
Create a new post.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "content": "string"
}
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "number",
    "title": "string",
    "content": "string",
    "user_id": "number",
    "created_at": "string"
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.
