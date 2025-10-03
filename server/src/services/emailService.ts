import nodemailer from "nodemailer";
import { EmailJobData } from "../queues/emailQueue";

const SMTP_HOST: string = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT: number = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER: string = process.env.SMTP_USER ?? "";
const SMTP_PASS: string = process.env.SMTP_PASS ?? "";
const FROM_EMAIL: string = process.env.FROM_EMAIL || SMTP_USER;

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: SMTP_PORT,
	secure: SMTP_PORT === 465,
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS,
	},
});

export const sendEmail = async (data: EmailJobData): Promise<void> => {
	await transporter.sendMail({
		from: FROM_EMAIL,
		to: data.to,
		subject: data.subject,
		html: data.html,
		text: data.text,
	});
};

export const generateVerificationEmailHTML = (
	username: string,
	verificationLink: string
): string => {
	return `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #28a745; 
                            color: white; text-decoration: none; border-radius: 5px; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; 
                            font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Welcome to EasyRide, ${username}!</h2>
                    <p>Thank you for registering. Please verify your email address to activate your account.</p>
                    <p>
                        <a href="${verificationLink}" class="button">Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p>${verificationLink}</p>
                    <p>This link will expire in 24 hours.</p>
                    <div class="footer">
                        <p>If you didn't create an account, please ignore this email.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
};
