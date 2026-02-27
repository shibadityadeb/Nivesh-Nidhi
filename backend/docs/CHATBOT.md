# Nidhi AI Chatbot Documentation

## Overview
Nidhi AI is an intelligent assistant for the NiveshNidhi blockchain-backed digital chit fund platform. It provides role-based support to both Members and Organizers, helping them manage their chit fund activities while maintaining strict security and compliance standards.

## Features

### For Members
- **Personal Chit Information**: View your chit memberships, statuses, and details
- **Transaction History**: Check your recent escrow transactions
- **Escrow Account Balance**: Monitor your escrow account status and balances
- **Payment Guidance**: Get information about upcoming payments and dues
- **Platform Help**: Learn how the platform works and compliance requirements

### For Organizers
- **Organization Management**: View all your organizations and their performance
- **Member Oversight**: Monitor member compliance, KYC status, and activities
- **Join Request Management**: Review pending join requests with KYC details
- **Performance Insights**: Get insights into chit group health and performance
- **Risk Monitoring**: Identify inactive members and potential issues
- **Escrow Monitoring**: Track escrow collections and releases across chit groups

## Security & Compliance

### Core Principles
1. **No Data Fabrication**: The AI only provides information that exists in the database
2. **Role-Based Access**: Members can only see their own data; Organizers can see their managed groups
3. **No Fund Control**: The chatbot cannot directly transfer funds or modify blockchain data
4. **Privacy Protection**: User privacy is maintained at all times
5. **Compliance First**: All suggestions respect KYC and compliance requirements

## Technical Architecture

### Backend Components

#### 1. Chatbot Service (`backend/src/services/chatbot.service.js`)
- **getUserContext()**: Fetches role-specific data from the database
  - For Members: Chit memberships, transactions, escrow accounts
  - For Organizers: Organizations, chit groups, join requests, member data
- **buildSystemPrompt()**: Creates role-specific system prompts for Claude AI
- **processMessage()**: Handles chat messages and communicates with Claude API
- **summarizeContext()**: Prepares context data for AI consumption

#### 2. Chatbot Controller (`backend/src/controllers/chatbot.controller.js`)
- **chat**: Handles incoming chat messages
- **getContext**: Provides initial context for chatbot initialization

#### 3. Chatbot Routes (`backend/src/routes/chatbot.routes.js`)
- `POST /api/chatbot/chat`: Send a message to the chatbot
- `GET /api/chatbot/context`: Get user context for initialization

### Frontend Components

#### Chatbot Component (`frontend/src/components/Chatbot.jsx`)
A beautiful, responsive chat interface with:
- Floating action button with AI badge
- Expandable chat window (400px x 600px)
- Message history with user/assistant avatars
- Real-time typing indicators
- Action intent highlighting (for structured responses)
- Automatic scroll to latest messages
- Enter-to-send keyboard support

#### API Integration (`frontend/src/lib/api.js`)
- `sendChatMessage()`: Sends messages to the backend
- `getChatbotContext()`: Fetches initial context

## API Usage

### Send Chat Message
```javascript
POST /api/chatbot/chat
Authorization: Bearer <token>

{
  "message": "What are my active chit groups?",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "You have 2 active chit groups...",
    "actionIntent": null,
    "context": {
      "userId": "uuid",
      "role": "MEMBER",
      "timestamp": "2026-02-26T..."
    }
  }
}
```

### Get Context
```javascript
GET /api/chatbot/context
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "role": "MEMBER",
    "userName": "John Doe",
    "kycStatus": "Verified",
    "hasChits": true
  }
}
```

## Action Intents

When users request actions (e.g., "send me a payment reminder"), the chatbot returns structured JSON:

```json
{
  "intent": "action_request",
  "action": "send_reminder",
  "parameters": {
    "type": "payment",
    "chitGroupId": "uuid"
  },
  "message": "I can send you a payment reminder. Would you like me to proceed?"
}
```

### Supported Actions
- **send_reminder**: Payment or meeting reminders
- **generate_report**: Performance or compliance reports
- **make_payment**: Initiate payment process
- **create_chit**: Create new chit group (Organizers only)
- **approve_request**: Approve join requests (Organizers only)

## Environment Variables

The chatbot uses the following environment variables (already configured in `backend/.env`):

```bash
CLAUDE_API_KEY=sk-ant-api03-WES8DtqfzPj_Cu4zcb...
# Choose a current model; older haiku‑latest flavor has been retired
CLAUDE_MODEL=claude-3-5  # or claude-3-5-sonnet / claude-3-5-haiku as needed
```

## Usage Examples

### Member Queries
- "What are my active chit groups?"
- "Show me my recent transactions"
- "What's my escrow balance?"
- "When is my next payment due?"
- "How do I verify my KYC?"

### Organizer Queries
- "Show me all pending join requests"
- "Which members haven't verified their KYC?"
- "What's the performance of my chit groups?"
- "How much has been collected in escrow for Group ABC?"
- "Who are the inactive members in my organization?"

## Integration

The chatbot is automatically integrated into your application:

1. **App.jsx**: The Chatbot component is added at the root level, available on all pages
2. **Authentication**: Only authenticated users can access the chatbot
3. **Role Detection**: Automatically detects user role (Member/Organizer) and adjusts accordingly
4. **Responsive**: Works on all screen sizes with a floating action button

## Customization

### Changing the Claude Model
Edit `backend/.env`:
```bash
CLAUDE_MODEL=claude-3-5-sonnet  # For more advanced responses
# or
CLAUDE_MODEL=claude-3-5-haiku   # For faster, cost-effective responses
# or simply CLAUDE_MODEL=claude-3-5 for the latest general-purpose 3.5 model
```

### Adjusting Response Length
Edit `backend/src/services/chatbot.service.js`:
```javascript
max_tokens: 1024,  // Increase for longer responses
```

### Styling the Chatbot
The chatbot uses Tailwind CSS. Edit `frontend/src/components/Chatbot.jsx` to customize colors, sizes, and layout.

## Testing

1. **Start the backend**: The backend should be running on port 3000
2. **Start the frontend**: Run your frontend development server
3. **Login**: Authenticate as either a Member or Organizer
4. **Click the AI button**: The floating button appears in the bottom-right corner
5. **Start chatting**: Ask questions relevant to your role

## Troubleshooting

### Chatbot not responding
- Check if backend is running: `curl http://localhost:3000/api/health`
- Verify CLAUDE_API_KEY is set in backend/.env
- Check browser console for errors

### Authentication errors
- Ensure you're logged in
- Check if token is valid (not expired)
- Verify the Authorization header is being sent

### Wrong data displayed
- The chatbot only shows data from the database
- Ensure your role is correctly set in the database
- Check that you have the necessary permissions

## Performance

- **Response Time**: Typically 1-3 seconds (depends on Claude API)
- **Context Window**: Maintains last 10 messages for conversation history
- **Database Queries**: Optimized with Prisma includes and selects
- **Caching**: User context is loaded once per session

## Future Enhancements

- **Multi-language support**: Hindi, Tamil, Telugu, etc.
- **Voice input/output**: Speech-to-text and text-to-speech
- **Predictive analytics**: AI-powered insights and predictions
- **Document generation**: Automated report generation
- **Notification integration**: Push notifications for important updates
- **Advanced actions**: Direct action execution (with user confirmation)

## Support

For issues or questions:
1. Check the browser console for errors
2. Review backend logs in `backend/server_logs.txt`
3. Verify Prisma schema matches the service queries
4. Ensure Claude API key is valid and has sufficient credits

---

**Powered by Claude AI** | **Secure & Compliant** | **Built for NiveshNidhi**