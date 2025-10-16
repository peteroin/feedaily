import twilio from 'twilio';
import db from './database.js';

const accountSid = 'AC1e2ac2816bc52d77d8d22e9fa7c45a3d';
const authToken = 'cdb1e6a45d9de813de060cb3ad7a736c';
const client = twilio(accountSid, authToken);

const twilioSandboxNumber = 'whatsapp:+14155238886'; // Twilio sandbox number

export async function sendWhatsAppNotification(toNumber, message) {
  try {
    const msg = await client.messages.create({
      from: twilioSandboxNumber,
      to: `whatsapp:${toNumber}`, // e.g. 'whatsapp:+919876543210'
      body: message,
    });
    console.log('WhatsApp message sent:', msg.sid);
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
}

// Get all Pro users from database
export async function getProUsers() {
  return new Promise((resolve, reject) => {
    db.all("SELECT contact FROM pro_subscriptions WHERE status = 'active'", (err, rows) => {
      if (err) {
        console.error('Error fetching Pro users:', err);
        reject(err);
      } else {
        const proUsers = rows.map(row => row.contact);
        console.log(`Found ${proUsers.length} Pro users`);
        resolve(proUsers);
      }
    });
  });
}

// Send WhatsApp to all Pro users
export async function sendWhatsAppToProUsers(message) {
  try {
    const proUsers = await getProUsers();

    if (proUsers.length === 0) {
      console.log('No Pro users found, skipping WhatsApp notification');
      return;
    }

    const promises = proUsers.map(contact =>
      sendWhatsAppNotification(contact, message)
    );

    await Promise.all(promises);
    console.log(`WhatsApp sent to ${proUsers.length} Pro users`);
  } catch (error) {
    console.error('Failed to send WhatsApp to Pro users:', error);
  }
}
