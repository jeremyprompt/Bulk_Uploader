export async function POST(request) {
  try {
    const { subdomain, authToken, payload } = await request.json();
    const url = `https://${subdomain}.prompt.io/rest/1.0/org_channels`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'orgAuthToken': authToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 