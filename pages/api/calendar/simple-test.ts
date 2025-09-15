import { NextApiRequest, NextApiResponse } from 'next';

// Simple test endpoint that doesn't require database
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return a simple success response
    res.status(200).json({
      success: true,
      message: 'Calendar API is working!',
      timestamp: new Date().toISOString(),
      endpoints: {
        ics: '/api/calendar/ics',
        webcal: '/api/calendar/webcal',
        test_sample: '/api/calendar/test-sample',
        subscription: '/api/calendar/subscription'
      }
    });
  } catch (error) {
    console.error('Error in simple test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
