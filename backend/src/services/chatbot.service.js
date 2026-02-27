const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
const DEPRECATED_MODEL_ALIASES = new Map([
  ['claude-3-5-haiku-latest', 'claude-3-5-haiku'],
]);

function buildModelCandidates() {
  const configured = (process.env.CLAUDE_MODEL || 'claude-3-5').trim();
  const normalized = DEPRECATED_MODEL_ALIASES.get(configured) || configured;
  const candidates = [
    normalized,
    'claude-3-5',
    'claude-3-5-haiku',
    'claude-3-5-sonnet',
    'claude-3-haiku-20240307',
  ];

  return [...new Set(candidates.filter(Boolean))];
}

class ChatbotService {
  /**
   * Get context data based on user role
   */
  async getUserContext(userId, role) {
    try {
      const context = {
        role,
        userId,
      };

      // Handle guest users (no userId provided)
      if (!userId || role === 'GUEST') {
        context.user = {
          id: null,
          name: 'Guest',
          email: null,
          role: 'GUEST',
          isKycVerified: false,
          risk_score: null,
          reputation_score: null,
        };
        return context;
      }

      // Get basic user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isKycVerified: true,
          risk_score: true,
          reputation_score: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      context.user = user;

      if (role === 'USER' || role === 'MEMBER') {
        console.log('[getUserContext] Fetching USER/MEMBER data for user:', userId);
        // Get member-specific data with error handling
        try {
          const chitMemberships = await prisma.chitGroupMember.findMany({
            where: { user_id: userId },
            include: {
              chit_group: {
                include: {
                  organization: {
                    select: {
                      name: true,
                      reputation_score: true,
                      risk_rating: true,
                    },
                  },
                },
              },
            },
          }).catch(() => []);

          const escrowTransactions = await prisma.escrowTransaction.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 10,
          }).catch(() => []);

          const escrowAccounts = await prisma.escrowAccount.findMany({
            where: {
              chit_group: {
                members: {
                  some: {
                    user_id: userId,
                  },
                },
              },
            },
          }).catch(() => []);

          context.chitMemberships = chitMemberships;
          context.escrowTransactions = escrowTransactions;
          context.escrowAccounts = escrowAccounts;
        } catch (memberError) {
          console.log('[getUserContext] Error fetching member data, using defaults:', memberError.message);
          context.chitMemberships = [];
          context.escrowTransactions = [];
          context.escrowAccounts = [];
        }
      } else if (role === 'ORGANIZER') {
        // Get organizer-specific data
        try {
          const organizations = await prisma.organization.findMany({
            where: {
              organizer_profile: {
                user_id: userId,
              },
            },
            include: {
              chit_groups: {
                include: {
                  members: {
                    include: {
                      chit_group: {
                        select: {
                          name: true,
                          status: true,
                        },
                      },
                    },
                  },
                  escrow_account: true,
                },
              },
            },
          });

          context.organizations = organizations;

          // Try to fetch join requests, but don't fail if table doesn't exist
          try {
            const joinRequests = await prisma.joinRequest.findMany({
              where: {
                group: {
                  organization: {
                    organizer_profile: {
                      user_id: userId,
                    },
                  },
                },
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    isKycVerified: true,
                  },
                },
                group: {
                  select: {
                    name: true,
                    id: true,
                  },
                },
              },
              orderBy: { created_at: 'desc' },
            });
            context.joinRequests = joinRequests;
          } catch (joinReqError) {
            console.log('[getUserContext] Join requests table not available, skipping');
            context.joinRequests = [];
          }
        } catch (orgError) {
          console.error('[getUserContext] Error fetching organizer data:', orgError.message);
          context.organizations = [];
          context.joinRequests = [];
        }
      }

      return context;
    } catch (error) {
      console.error('Error fetching user context:', error);
      console.error('Error details - userId:', userId, 'role:', role);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  /**
   * Build system prompt based on role
   */
  buildSystemPrompt(role) {
    const basePrompt = `You are Nidhi AI, an intelligent assistant for a blockchain-backed digital chit fund platform called NiveshNidhi. You help users understand their chit fund activities, payments, and compliance status.

SECURITY & COMPLIANCE RULES:
- Never fabricate or hallucinate data
- Only provide information that exists in the context data
- Always maintain user privacy and security
- Never allow direct fund control or blockchain modification
- Always check compliance and KYC status before suggesting actions`;

    if (role === 'USER' || role === 'MEMBER') {
      return `${basePrompt}

MEMBER ROLE RESTRICTIONS:
- Provide only personal chit fund information
- Show only the user's own payment history
- Display only their escrow balance
- Never show other members' private data
- Can answer questions about:
  * Their chit memberships
  * Their payment history and due dates
  * Their escrow account balance
  * Chit group status they're part of
  * How the platform works
  * Compliance requirements

RESPONSE FORMAT:
- For general information queries: Provide a clear, natural language response
- For questions about their memberships or recommendations: Provide helpful analysis based on the available data
- For action requests like "remind me about payment" or "generate my report", respond with ONLY a JSON structure:
{
  "intent": "action_request" | "information",
  "action": "send_reminder" | "generate_report" | "make_payment" (if applicable),
  "parameters": { relevant parameters } (if applicable),
  "message": "user-friendly message with all the details and analysis"
}

IMPORTANT: When the user asks informational questions (not action requests), respond with ONLY the JSON where intent is "information" and message contains your full natural response. Do NOT wrap JSON in code blocks or add extra text outside the JSON.`;
    } else if (role === 'ORGANIZER') {
      return `${basePrompt}

ORGANIZER ROLE CAPABILITIES:
- Provide management insights across all chit groups they organize
- Show member lists and their compliance status
- Identify defaulters and payment patterns
- Generate performance reports
- Monitor chit group health
- Review join requests
- Can answer questions about:
  * Organization performance metrics
  * Member compliance and KYC status
  * Payment patterns and defaulters
  * Chit group performance
  * Join requests and member management
  * Platform compliance requirements

ORGANIZER RESTRICTIONS:
- Cannot directly transfer funds or modify blockchain
- Cannot access member's personal financial data beyond platform activities
- Cannot bypass compliance checks

RESPONSE FORMAT:
- For general information queries: Provide a clear, natural language response
- For questions about best investments or recommendations: Provide helpful analysis based on the available data
- For action requests like "create chit group", "send reminder to defaulters", "generate performance report", respond with ONLY a JSON structure:
{
  "intent": "action_request" | "information",
  "action": "create_chit" | "send_reminder" | "generate_report" | "approve_request" (if applicable),
  "parameters": { relevant parameters } (if applicable),
  "message": "user-friendly message with all the details and analysis"
}

IMPORTANT: When the user asks informational questions (not action requests), respond with ONLY the JSON where intent is "information" and message contains your full natural response. Do NOT wrap JSON in code blocks or add extra text outside the JSON.`;
    } else if (role === 'GUEST') {
      return `${basePrompt}

GUEST ROLE CAPABILITIES:
- Provide general information about chit funds and the NiveshNidhi platform
- Explain how the platform works
- Describe different roles (Members, Organizers, Admins)
- Answer questions about features and benefits
- Provide compliance and KYC requirements
- Guide users on how to get started
- Can answer questions about:
  * How chit funds work
  * Platform features and capabilities
  * Benefits of joining a chit group
  * KYC and compliance requirements
  * How to sign up or login
  * Payment and escrow processes
  * Risk assessment and reputation scoring

GUEST RESTRICTIONS:
- Cannot access any personal user data
- Cannot perform any transactions
- Can only provide general educational information
- Should encourage users to create an account to access personalized features`;
    } else {
      return basePrompt;
    }
  }

  /**
   * Process chat message
   */
  async processMessage(userId, role, message, conversationHistory = []) {
    try {
      // Get user context
      const context = await this.getUserContext(userId, role);

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(role);

      // Prepare context summary for the AI
      const contextSummary = this.summarizeContext(context);

      // Validate and clean conversation history
      // Anthropic API requires messages to alternate between user and assistant
      // and must start with a user message
      const cleanedHistory = this.cleanConversationHistory(conversationHistory);

      console.log('Conversation history cleaned:', {
        original: conversationHistory.length,
        cleaned: cleanedHistory.length,
      });

      // Build messages array
      const messages = [
        ...cleanedHistory,
        {
          role: 'user',
          content: `User Context:\n${contextSummary}\n\nUser Question: ${message}`,
        },
      ];

      console.log('Calling Claude API with', messages.length, 'messages');

      // Call Claude API with fallback models for retired/invalid model names
      const modelCandidates = buildModelCandidates();
      let response = null;
      let lastModelError = null;

      for (const model of modelCandidates) {
        try {
          response = await anthropic.messages.create({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages,
          });
          break;
        } catch (apiError) {
          const isNotFoundModel = apiError?.status === 404
            && apiError?.error?.error?.type === 'not_found_error';
          if (isNotFoundModel) {
            lastModelError = apiError;
            console.warn(`[ChatbotService] Model unavailable: ${model}. Trying next fallback model.`);
            continue;
          }
          throw apiError;
        }
      }

      if (!response) {
        throw lastModelError || new Error('No compatible Claude model available');
      }

      const aiResponse = response.content[0].text;

      // Check if response contains action intent
      let actionIntent = null;
      let cleanedResponse = aiResponse;
      
      try {
        // Try to parse JSON if the response contains it
        // First, try to extract the JSON object from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*?"intent"[\s\S]*?\}/);
        if (jsonMatch) {
          // Clean the JSON string by removing extra whitespace and newlines
          const jsonString = jsonMatch[0]
            .replace(/\n/g, ' ')  // Replace newlines with spaces
            .replace(/\r/g, '')   // Remove carriage returns
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
          
          actionIntent = JSON.parse(jsonString);
          
          // If the response is a JSON object with a message field, extract the message
          if (actionIntent && actionIntent.message) {
            cleanedResponse = actionIntent.message;
          } else {
            // Remove the JSON part from the response
            cleanedResponse = aiResponse.replace(jsonMatch[0], '').trim();
          }
        }
      } catch (e) {
        // Not a JSON response, that's fine
        console.log('Failed to parse JSON from response:', e.message);
        console.log('Raw response:', aiResponse.substring(0, 200));
      }

      return {
        response: cleanedResponse,
        actionIntent,
        context: {
          userId,
          role,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      console.error('Error processing chat message:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        status: error.status,
        type: error.type,
      });
      throw new Error('Failed to process message: ' + error.message);
    }
  }

  /**
   * Clean and validate conversation history for Anthropic API
   * Ensures messages alternate between user and assistant, starting with user
   */
  cleanConversationHistory(history) {
    if (!history || history.length === 0) {
      return [];
    }

    const cleaned = [];
    let lastRole = null;

    for (const msg of history) {
      // Skip invalid messages
      if (!msg.role || !msg.content) {
        continue;
      }

      // Ensure alternating roles
      if (msg.role !== lastRole) {
        cleaned.push({
          role: msg.role,
          content: msg.content,
        });
        lastRole = msg.role;
      }
    }

    // Ensure the conversation starts with a user message
    // Remove any leading assistant messages
    while (cleaned.length > 0 && cleaned[0].role === 'assistant') {
      cleaned.shift();
    }

    return cleaned;
  }

  /**
   * Summarize context for AI consumption
   */
  summarizeContext(context) {
    let summary = `User: ${context.user.name} (${context.user.email})\n`;
    summary += `Role: ${context.role}\n`;
    summary += `KYC Status: ${context.user.isKycVerified ? 'Verified' : 'Not Verified'}\n`;
    summary += `Risk Score: ${context.user.risk_score || 'N/A'}\n`;
    summary += `Reputation Score: ${context.user.reputation_score || 'N/A'}\n\n`;

    if (context.role === 'USER' || context.role === 'MEMBER') {
      summary += `=== CHIT MEMBERSHIPS ===\n`;
      if (context.chitMemberships && context.chitMemberships.length > 0) {
        context.chitMemberships.forEach((membership) => {
          summary += `- ${membership.chit_group.name}\n`;
          summary += `  Status: ${membership.chit_group.status}\n`;
          summary += `  Value: ₹${membership.chit_group.chit_value}\n`;
          summary += `  Duration: ${membership.chit_group.duration_months} months\n`;
          summary += `  Organization: ${membership.chit_group.organization.name}\n`;
          summary += `  Member Status: ${membership.status}\n\n`;
        });
      } else {
        summary += `No active chit memberships\n\n`;
      }

      summary += `=== RECENT TRANSACTIONS ===\n`;
      if (context.escrowTransactions && context.escrowTransactions.length > 0) {
        context.escrowTransactions.slice(0, 5).forEach((tx) => {
          summary += `- ₹${tx.amount} on ${tx.created_at.toLocaleDateString()}\n`;
          summary += `  Status: ${tx.status}\n`;
          summary += `  Type: ${tx.type}\n\n`;
        });
      } else {
        summary += `No transaction history\n\n`;
      }

      summary += `=== ESCROW ACCOUNTS ===\n`;
      if (context.escrowAccounts && context.escrowAccounts.length > 0) {
        context.escrowAccounts.forEach((account) => {
          summary += `Total Collected: ₹${account.total_collected}\n`;
          summary += `Total Released: ₹${account.total_released}\n`;
          summary += `Locked Amount: ₹${account.locked_amount}\n`;
          summary += `Status: ${account.status}\n\n`;
        });
      } else {
        summary += `No escrow accounts\n`;
      }
    } else if (context.role === 'ORGANIZER') {
      summary += `=== ORGANIZATIONS ===\n`;
      if (context.organizations && context.organizations.length > 0) {
        context.organizations.forEach((org) => {
          summary += `- ${org.name}\n`;
          summary += `  Compliance Score: ${org.compliance_score || 'N/A'}\n`;
          summary += `  Total Chit Groups: ${org.chit_groups.length}\n\n`;

          org.chit_groups.forEach((group) => {
            summary += `  * ${group.name}\n`;
            summary += `    Status: ${group.status}\n`;
            summary += `    Members: ${group.current_members}/${group.member_capacity}\n`;
            summary += `    Value: ₹${group.chit_value}\n`;
            summary += `    Duration: ${group.duration_months} months\n`;
            
            // Identify defaulters or inactive members
            const inactiveMembers = group.members.filter(
              (m) => m.status !== 'ACTIVE'
            );
            if (inactiveMembers.length > 0) {
              summary += `    ⚠️ Inactive/Removed Members: ${inactiveMembers.length}\n`;
            }
            
            // Escrow info
            if (group.escrow_account) {
              summary += `    Escrow Collected: ₹${group.escrow_account.total_collected}\n`;
              summary += `    Escrow Released: ₹${group.escrow_account.total_released}\n`;
            }
            summary += `\n`;
          });
        });
      } else {
        summary += `No organizations managed\n\n`;
      }

      summary += `=== PENDING JOIN REQUESTS ===\n`;
      if (context.joinRequests && context.joinRequests.length > 0) {
        const pending = context.joinRequests.filter((r) => r.status === 'pending');
        summary += `Pending: ${pending.length}\n`;
        pending.slice(0, 5).forEach((req) => {
          summary += `- ${req.user.name} for ${req.group.name}\n`;
          summary += `  KYC: ${req.user.isKycVerified ? 'Verified' : 'Not Verified'}\n`;
        });
      } else {
        summary += `No pending join requests\n`;
      }
    }

    return summary;
  }
}

module.exports = new ChatbotService();
