// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 3
// FILE: agents/scaffolding-agent/services/ghl.ts
// PURPOSE: GoHighLevel integration setup
// GENESIS REF: STACK_SETUP.md - GHL Integration
// WSL PATH: ~/project-genesis/agents/scaffolding-agent/services/ghl.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';

interface GHLSetupResult {
  locationId: string;
  webhookUrl: string;
  status: 'success' | 'error';
  message?: string;
}

/**
 * Setup GoHighLevel integration
 *
 * Validates GHL API credentials and provides setup instructions
 *
 * @param projectName - Name of the project
 */
export async function setupGHL(projectName: string): Promise<GHLSetupResult> {
  try {
    // Check for GHL credentials in environment
    const apiKey = process.env.GHL_API_KEY;
    const locationId = process.env.GHL_LOCATION_ID;

    if (!apiKey || !locationId) {
      return {
        locationId: '',
        webhookUrl: '',
        status: 'error',
        message: `
⚠️  GoHighLevel Not Configured

GHL integration requires API credentials. To set up:

1. Log in to your GoHighLevel account
2. Go to Settings > API Keys
3. Create a new API key
4. Copy the API key and your Location ID
5. Add to your environment:

   GHL_API_KEY=your-api-key
   GHL_LOCATION_ID=your-location-id

6. Update the project's .env.local:

   GHL_API_KEY=your-api-key
   GHL_LOCATION_ID=your-location-id
   GHL_WEBHOOK_URL=https://your-domain.com/api/webhooks/ghl

Note: GHL integration is optional for landing pages.
        `
      };
    }

    // Validate API key by making a test request
    try {
      const response = await axios.get(
        `https://rest.gohighlevel.com/v1/locations/${locationId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      if (response.status === 200) {
        return {
          locationId,
          webhookUrl: `https://${projectName}.netlify.app/api/webhooks/ghl`,
          status: 'success',
          message: `
✅ GoHighLevel Connected!

Location: ${response.data.name || locationId}
Webhook URL: https://${projectName}.netlify.app/api/webhooks/ghl

Next steps:
1. Configure webhook in GHL dashboard
2. Test lead sync after deployment
3. Monitor webhook logs
          `
        };
      }
    } catch (apiError: any) {
      if (apiError.response?.status === 401) {
        return {
          locationId: '',
          webhookUrl: '',
          status: 'error',
          message: '❌ Invalid GHL API key. Please check your credentials.'
        };
      }

      if (apiError.response?.status === 404) {
        return {
          locationId: '',
          webhookUrl: '',
          status: 'error',
          message: '❌ Invalid GHL Location ID. Please check your location ID.'
        };
      }

      throw apiError;
    }

    return {
      locationId,
      webhookUrl: `https://${projectName}.netlify.app/api/webhooks/ghl`,
      status: 'success'
    };

  } catch (error) {
    console.error('GHL setup error:', error);
    return {
      locationId: '',
      webhookUrl: '',
      status: 'error',
      message: `
⚠️  GHL Configuration Failed

${error instanceof Error ? error.message : String(error)}

GHL integration is optional. You can:
- Skip GHL for now and configure later
- Check your network connection
- Verify your GHL credentials
- Contact GHL support if issues persist
      `
    };
  }
}

/**
 * Validate GHL connection
 *
 * @param projectPath - Path to the project
 */
export async function validateGHLConnection(projectPath: string): Promise<boolean> {
  try {
    const envPath = path.join(projectPath, '.env.local');

    try {
      const envContent = await fs.readFile(envPath, 'utf-8');

      // Check if GHL credentials are configured
      const hasApiKey = envContent.includes('GHL_API_KEY=') &&
                        !envContent.includes('your-ghl-api-key');
      const hasLocationId = envContent.includes('GHL_LOCATION_ID=') &&
                           !envContent.includes('your-location-id');

      return hasApiKey && hasLocationId;
    } catch {
      return false;
    }
  } catch (error) {
    console.error('GHL validation error:', error);
    return false;
  }
}

/**
 * Generate GHL webhook handler code
 */
export function generateGHLWebhookHandler(): string {
  return `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature (implement based on GHL docs)
    // const signature = request.headers.get('x-ghl-signature');

    // Process webhook event
    console.log('GHL Webhook received:', body);

    // Handle different event types
    switch (body.type) {
      case 'ContactCreate':
        // Handle new contact
        break;
      case 'ContactUpdate':
        // Handle contact update
        break;
      default:
        console.log('Unhandled webhook type:', body.type);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
`;
}

/**
 * Test GHL API connection
 *
 * @param apiKey - GHL API key
 * @param locationId - GHL location ID
 */
export async function testGHLConnection(
  apiKey: string,
  locationId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axios.get(
      `https://rest.gohighlevel.com/v1/locations/${locationId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        message: `Connected to location: ${response.data.name || locationId}`
      };
    }

    return {
      success: false,
      message: 'Unexpected response from GHL API'
    };

  } catch (error: any) {
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Invalid API key'
      };
    }

    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Invalid location ID'
      };
    }

    return {
      success: false,
      message: error.message || 'Connection failed'
    };
  }
}
