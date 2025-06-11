export const runtime = 'nodejs';
import fetch from 'node-fetch';

export async function POST(request) {
  try {
    const body = await request.json();
    const { subdomain, authToken, payload } = body;

    // Validate required fields
    if (!subdomain || !authToken || !payload) {
      return Response.json({ 
        error: 'Missing required fields',
        details: 'subdomain, authToken, and payload are required'
      }, { status: 400 });
    }

    const url = `https://${subdomain}.prompt.io/rest/1.0/org_channels?assignToEveryone=true`;
    
    console.log('Making request to:', url);
    console.log('With payload:', JSON.stringify(payload, null, 2));
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'orgAuthToken': authToken,
          'User-Agent': 'BulkUploader/1.0'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      
      // Try to get the response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return Response.json({ 
          error: 'Invalid JSON response from server',
          details: responseText
        }, { status: 500 });
      }

      console.log('Response data:', JSON.stringify(data, null, 2));

      return Response.json(data, { status: response.status });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return Response.json({ 
        error: 'Failed to make request to Prompt.io',
        details: fetchError.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message,
      stack: error.stack,
      details: 'Failed to create channel'
    }, { status: 500 });
  }
} 