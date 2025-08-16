import twilio from 'twilio';

// const accountSid = 'AC1e2ac2816bc52d77d8d22e9fa7c45a3d';   
// const authToken  = 'cdb1e6a45d9de813de060cb3ad7a736c';    
const client     = twilio(accountSid, authToken);

const twilioSandboxNumber = 'whatsapp:+14155238886'; // Twilio sandbox number

export async function sendWhatsAppNotification(toNumber, message) {
  try {
    const msg = await client.messages.create({
      from: twilioSandboxNumber,
      to  : `whatsapp:${toNumber}`, // e.g. 'whatsapp:+919876543210'
      body: message,
    });
    console.log('WhatsApp message sent:', msg.sid);
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
}
