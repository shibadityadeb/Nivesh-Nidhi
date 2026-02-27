# Nivesh Nidhi API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Register New User
**POST** `/api/auth/signup`

**Authentication:** None required

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "9876543210",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- `name`: 2-100 characters, required
- `email`: Valid email format, required, unique
- `phone`: 10-digit Indian phone number (starts with 6-9), required
- `password`: Minimum 8 characters with uppercase, lowercase, and number, required

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-string",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "9876543210",
      "role": "user",
      "isKycVerified": false
    },
    "token": "jwt-token-string"
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `409`: Email already registered
- `500`: Registration failed

---

### 2. Login User
**POST** `/api/auth/login`

**Authentication:** None required

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-string",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "9876543210",
      "role": "user",
      "isKycVerified": false
    },
    "token": "jwt-token-string"
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Invalid email or password
- `500`: Login failed

---

### 3. Get User Profile
**GET** `/api/auth/profile`

**Authentication:** Required (JWT Token)

**Headers:**
```json
{
  "Authorization": "Bearer <jwt-token>",
  "Content-Type": "application/json"
}
```

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "9876543210",
      "role": "user",
      "isKycVerified": true,
      "aadhaarName": "JOHN DOE",
      "aadhaarDob": "01/01/1990",
      "createdAt": "2026-02-23T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401`: Access denied / Invalid token
- `404`: User not found
- `500`: Failed to fetch profile

---

## KYC Endpoints

### 4. Upload Aadhaar for OCR KYC
**POST** `/api/kyc/aadhaar`

**Authentication:** Required (JWT Token)

**Headers:**
```json
{
  "Authorization": "Bearer <jwt-token>",
  "Content-Type": "multipart/form-data"
}
```

**Request Body (Form Data):**
```
aadhaar: <file> (Image file: JPEG, PNG, GIF, PDF - Max 5MB)
```

**Example using curl:**
```bash
curl -X POST \
  http://localhost:3000/api/kyc/aadhaar \
  -H 'Authorization: Bearer <jwt-token>' \
  -F 'aadhaar=@/path/to/aadhaar-image.jpg'
```

**Example using JavaScript FormData:**
```javascript
const formData = new FormData();
formData.append('aadhaar', fileInput.files[0]);

fetch('/api/kyc/aadhaar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "KYC verification successful",
  "data": {
    "isKycVerified": true,
    "extracted": {
      "name": "JOHN DOE",
      "dob": "01/01/1990",
      "aadhaarNumber": "XXXX-XXXX-1234",
      "address": "123 Main Street, City, State, PIN"
    }
  }
}
```

**Error Responses:**
- `400`: Aadhaar image is required / File size too large
- `401`: Access denied / Invalid token
- `409`: Aadhaar already registered with another account
- `422`: Could not extract Aadhaar data from image
- `500`: KYC verification failed

---

### 5. Check KYC Status
**GET** `/api/kyc/status`

**Authentication:** Required (JWT Token)

**Headers:**
```json
{
  "Authorization": "Bearer <jwt-token>",
  "Content-Type": "application/json"
}
```

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "isKycVerified": true,
    "aadhaarName": "JOHN DOE",
    "aadhaarDob": "01/01/1990",
    "hasAadhaar": true
  }
}
```

**Error Responses:**
- `401`: Access denied / Invalid token
- `404`: User not found
- `500`: Failed to fetch KYC status

---

## Health Check Endpoint

### Health Check
**GET** `/api/health`

**Authentication:** None required

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Nivesh Nidhi API is running",
  "timestamp": "2026-02-23T10:30:00.123Z"
}
```

---

## Error Response Format

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development)",
  "errors": ["Validation error array (for validation failures)"]
}
```

## HTTP Status Codes Used

- `200`: Success
- `201`: Created (successful signup)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `422`: Unprocessable Entity (OCR extraction failed)
- `500`: Internal Server Error

## File Upload Constraints

- **Supported formats**: JPEG, PNG, GIF, PDF
- **Maximum file size**: 5MB
- **Field name**: `aadhaar`
- **Upload directory**: `backend/uploads/` (auto-created)
- **File naming**: `aadhaar-{timestamp}-{random}.{ext}`

## JWT Token

- **Algorithm**: HS256
- **Expiry**: 7 days (configurable via JWT_EXPIRES_IN)
- **Payload**: `{ id: "user-uuid" }`
- **Header format**: `Bearer <token>`

## Environment Variables Required

```env
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
OCR_SPACE_API_KEY=your_ocr_space_api_key
NODE_ENV=development
```




















