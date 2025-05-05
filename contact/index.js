const http = require('http');
const nodemailer = require('nodemailer');
const { URL } = require('url');

// --- Configuration ---
// IMPORTANT: Use environment variables for sensitive data in production
const EMAIL_CONTACT = process.env.EMAIL_CONTACT || 'contact@beedaya.com'; // Replace with your actual email or load from env
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD; // Replace with your actual password or load from env
// const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'recipient@example.com'; // Email address to send contact forms to
// const SERVER_PORT = process.env.PORT || 3000; // Port to listen on

// --- Nodemailer Transporter ---
const transporter = nodemailer.createTransport({
    host: 'mail.beedaya.com', // Replace with your SMTP host if different
    port: 465,
    secure: true, // true for 465
    auth: {
      user: EMAIL_CONTACT,
      pass: EMAIL_PASSWORD
    },
    // Optional: Add TLS options if needed (e.g., for self-signed certs)
    // tls: {
    //   rejectUnauthorized: false
    // }
});

// --- Simple In-Memory Rate Limiter ---
const rateLimitStore = {}; // Store IP addresses and their request timestamps
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // Max requests per IP per window

function isRateLimited(ip) {
    const now = Date.now();
    const userRequests = rateLimitStore[ip] || [];

    // Filter out requests older than the window
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);

    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return true; // Rate limited
    }

    // Add current request timestamp and update store (keeping only recent ones)
    recentRequests.push(now);
    rateLimitStore[ip] = recentRequests;
    return false;
}

// --- HTTP Server ---
const server = http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // --- Rate Limiting Check ---
    if (isRateLimited(clientIp)) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Too Many Requests' }));
        return;
    }

    // --- Routing ---
    if (requestUrl.pathname === '/contact' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', async () => {
            try {
                // Assuming JSON body, parse it
                // For form-urlencoded, you'd need querystring.parse(body)
                const formData = JSON.parse(body);

                // --- Basic Validation (Add more as needed) ---
                if (!formData.name || !formData.email || !formData.message) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Missing required fields (name, email, message)' }));
                }


                // --- Load Email Template ---
                let htmlTemplate = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Thank You for Contacting BEEDAYA</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4; }
                        .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px; overflow: hidden; }
                        .email-header { background-color: #0b203c; /* Dark Blue */ padding: 20px; text-align: center; }
                        .email-header h1 { margin: 0; font-size: 24px; font-weight: bold; color: #FFC107 !important; } /* Ensure h1 color is white */
                        .email-content { padding: 30px; }
                        .email-content p { margin-bottom: 15px; }
                        .email-content strong { color: #0b203c; }
                        .details { background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 15px; margin-top: 20px; border-radius: 4px; }
                        .details p { margin-bottom: 8px; }
                        .email-footer { background-color: #f4f4f4; color: #777777; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #dddddd; }
                        .email-footer a { color: #0b203c; text-decoration: none; }
                        pre { white-space: pre-wrap; word-wrap: break-word; background-color: #f9f9f9; padding: 10px; border: 1px solid #eee; border-radius: 3px; font-family: monospace; }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>BEEDAYA</h1>
                        </div>
                        <div class="email-content">
                            <p>Dear {{name}},</p>
                            <p>Thank you for contacting BEEDAYA. We have successfully received your message and appreciate you reaching out.</p>
                            <p>Our team will review your request and will get back to you in the best possible time.</p>
                
                            <div class="details">
                                <p><strong>Your Submitted Details:</strong></p>
                                <p><strong>Name:</strong> {{name}}</p>
                                <p><strong>Email:</strong> {{email}}</p>
                                {{phone_details}} <!-- Placeholder for optional phone -->
                                <p><strong>Message:</strong></p>
                                <pre>{{message}}</pre>
                            </div>
                
                            <p>We look forward to assisting you.</p>
                            <br>
                            <p>Best regards,<br><br><strong>The BEEDAYA Team</strong></p>
                        </div>
                        <div class="email-footer">
                            <p>&copy; {{year}} BEEDAYA | All Rights Reserved.</p>
                            <p>08 Rue Hallouane Tahar, Ain Benian, Algiers | <a href="mailto:contact@beedaya.com">contact@beedaya.com</a></p>
                            <p><a href="https://www.beedaya.com">www.beedaya.com</a></p>
                        </div>
                    </div>
                </body>
                </html>`;
                // try {
                //     // Construct the absolute path to the template file
                //     const templatePath = path.join(__dirname, 'email-template.html');
                //     htmlTemplate = fs.readFileSync(templatePath, 'utf8');
                // } catch (fileError) {
                //     console.error('Error reading email template:', fileError);
                //     res.writeHead(500, { 'Content-Type': 'application/json' });
                //     return res.end(JSON.stringify({ error: 'Internal server error: Could not load email template.' }));
                // }

                // --- Populate Template ---
                let populatedHtml = htmlTemplate
                    .replace(/{{name}}/g, formData.name || 'N/A') // Use || 'N/A' as fallback
                    .replace(/{{email}}/g, formData.email || 'N/A')
                    .replace(/{{message}}/g, formData.message || 'N/A')
                    .replace(/{{year}}/g, new Date().getFullYear());

                // Handle optional phone number
                if (formData.phone && formData.phone.trim() !== '') {
                    const phoneHtml = `<p><strong>Phone:</strong> ${formData.phone}</p>`;
                    populatedHtml = populatedHtml.replace('{{phone_details}}', phoneHtml);
                } else {
                    // Remove the placeholder if no phone number is provided
                    populatedHtml = populatedHtml.replace('{{phone_details}}', '');
                }

                // --- Email Options ---
                const mailOptions = {
                    from: `"BEEDAYA Contact" <${EMAIL_CONTACT}>`, // Sender address (must often be the authenticated user)
                    // to: RECIPIENT_EMAIL, // List of receivers
                    // send to both receipient and sender
                    to: `${EMAIL_CONTACT}, ${formData.email}`, // List of receivers
                    replyTo: EMAIL_CONTACT, // Set Reply-To to the user's email
                    subject: `New Contact Form Submission from ${formData.name}`, // Subject line
                    // text: `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'N/A'}\nMessage: ${formData.message}`, // Plain text body
                    // Optional: HTML body
                    html: populatedHtml // Use the populated HTML template
                };

                // --- Send Email ---
                await transporter.sendMail(mailOptions);
                console.log(`Email sent successfully from ${formData.email}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Message sent successfully!' }));

            } catch (error) {
                console.error('Error processing contact form:', error);
                // Differentiate between parsing errors and mail sending errors
                if (error instanceof SyntaxError) {
                     res.writeHead(400, { 'Content-Type': 'application/json' });
                     res.end(JSON.stringify({ error: 'Invalid request body format. JSON expected.' }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to send message. Please try again later.' }));
                }
            }
        });

    } else {
        // --- Not Found ---
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// --- Start Server ---
server.listen(/*SERVER_PORT, */() => {
    // console.log(`Server listening on port ${SERVER_PORT}`);
    console.log(`Contact endpoint available at POST /contact`);
    // Verify transporter config on startup (optional but recommended)
    transporter.verify(function(error, success) {
       if (error) {
            console.error('Nodemailer transporter configuration error:', error);
       } else {
            console.log('Nodemailer transporter is ready to send emails');
       }
    });
});
