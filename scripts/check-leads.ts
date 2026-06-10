import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PH_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PH_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const PH_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

async function fetchEventCount(eventName: string) {
  // Query trends for the last 30 days
  const url = `${PH_HOST}/api/projects/${PH_PROJECT_ID}/insights/trend/?events=[{"id":"${eventName}","type":"events"}]&date_from=-30d`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${PH_API_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Error fetching ${eventName}: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.result && data.result[0] && data.result[0].aggregated_value !== undefined) {
    return data.result[0].aggregated_value;
  }
  return 0;
}

async function main() {
  console.log('Fetching lead data from PostHog (Last 30 days)...');
  try {
    const whatsapp = await fetchEventCount('whatsapp_click');
    const phone = await fetchEventCount('phone_click');
    const email = await fetchEventCount('email_click');
    const quote = await fetchEventCount('quote_submitted');
    
    console.log('---');
    console.log(`WhatsApp Clicks: ${whatsapp}`);
    console.log(`Phone Clicks:    ${phone}`);
    console.log(`Email Clicks:    ${email}`);
    console.log(`Contact Forms:   ${quote}`);
    console.log('---');
    console.log(`TOTAL LEADS INITIATED: ${whatsapp + phone + email + quote}`);
  } catch (error) {
    console.error(error);
  }
}

main();
