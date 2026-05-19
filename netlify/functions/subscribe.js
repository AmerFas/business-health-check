exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, levelNum } = JSON.parse(event.body);
  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
  const DC = API_KEY.split('-')[1];

  const tagMap = {
    1: 'Level 1 - Overwhelm',
    2: 'Level 2 - Overworked',
    3: 'Level 3 - Organised',
    4: 'Level 4 - Overseer',
    5: 'Level 5 - Owner'
  };

  try {
    const response = await fetch(
      `https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `apikey ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          tags: [tagMap[levelNum]]
        })
      }
    );

    const data = await response.json();

    if (response.ok || data.title === 'Member Exists') {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: data.detail }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
