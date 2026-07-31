import Subscriber from '../models/Subscriber.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    let subscriber = await Subscriber.findOne({ email });

    if (subscriber) {
      if (subscriber.status === 'active') {
        return res.status(400).json({ success: false, message: 'You are already subscribed to our newsletter.' });
      } else {
        subscriber.status = 'active';
        await subscriber.save();
        return res.json({ success: true, message: 'Subscription successfully reactivated!' });
      }
    }

    subscriber = await Subscriber.create({ email });
    res.status(201).json({ success: true, message: 'Thank you for subscribing to our newsletter!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
export const unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const subscriber = await Subscriber.findOne({ email });
    if (!subscriber || subscriber.status === 'unsubscribed') {
      return res.status(404).json({ success: false, message: 'Subscription not found or already cancelled.' });
    }

    subscriber.status = 'unsubscribed';
    await subscriber.save();

    res.json({ success: true, message: 'You have unsubscribed from the newsletter.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subscribers (Admin only)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
export const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });
    res.json({ success: true, subscribers });
  } catch (error) {
    next(error);
  }
};

// Helper to compile text content into a premium responsive HTML email
const compileHtmlEmail = (subject, body, unsubscribeLink) => {
  const formattedBody = body
    .split('\n\n')
    .map(para => `<p style="margin-bottom: 1.5em; line-height: 1.7; font-size: 15px; color: #333333;">${para.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f6f6f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f6f6f6;
      padding-top: 40px;
      padding-bottom: 40px;
    }
    .main-card {
      max-width: 600px;
      background-color: #ffffff;
      margin: 0 auto;
      border: 1px solid #e9e9e9;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .header {
      padding: 30px 40px;
      border-bottom: 1px solid #f0f0f0;
      text-align: center;
    }
    .header-logo {
      font-family: Georgia, serif;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #1a1a1a;
      text-decoration: none;
    }
    .content {
      padding: 40px 40px 30px 40px;
    }
    .footer {
      padding: 20px 40px;
      background-color: #fafafa;
      border-top: 1px solid #f0f0f0;
      text-align: center;
      font-size: 11px;
      color: #999999;
      line-height: 1.5;
    }
    .footer a {
      color: #a3704c;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <div class="header">
        <a href="#" class="header-logo" style="font-family: Georgia, serif; font-size: 20px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; color: #1a1a1a; text-decoration: none;">BYLINE</a>
      </div>
      <div class="content">
        <h2 style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 20px; color: #1a1a1a; line-height: 1.3;">
          ${subject}
        </h2>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${formattedBody}
        </div>
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px 0;">You are receiving this because you subscribed to the Byline newsletter.</p>
        <p style="margin: 0;">
          <a href="${unsubscribeLink}" target="_blank" style="color: #a3704c; text-decoration: underline;">Unsubscribe</a> from this list at any time.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

// @desc    Send newsletter (Admin only)
// @route   POST /api/newsletter/send
// @access  Private/Admin
export const sendNewsletter = async (req, res, next) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ success: false, message: 'Subject and body are required.' });
    }

    const activeSubscribers = await Subscriber.find({ status: 'active' });
    if (activeSubscribers.length === 0) {
      return res.status(400).json({ success: false, message: 'No active subscribers to send to.' });
    }

    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const previewEmail = activeSubscribers[0].email;
    const unsubscribeLink = `${clientUrl}/unsubscribe?email=${encodeURIComponent(previewEmail)}`;
    const compiledHtml = compileHtmlEmail(subject, body, unsubscribeLink);

    console.log(`--- Dispatching HTML Newsletter ---`);
    console.log(`Subject: ${subject}`);
    console.log(`Sending to ${activeSubscribers.length} active subscriber(s)...`);

    // In a live server configuration, you would use node-mailer, SendGrid, or Resend here.
    // await sendEmailHelper({ to: list, subject, html: compiledHtml });

    res.json({
      success: true,
      message: `Newsletter dispatch simulated successfully to ${activeSubscribers.length} subscriber(s).`,
      previewHtml: compiledHtml
    });
  } catch (error) {
    next(error);
  }
};
