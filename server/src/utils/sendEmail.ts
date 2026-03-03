import { env } from "@configs/env.js";
import { Resend } from 'resend'; // 
import { logger } from "./logger.js";
import { ServerError } from "@customs/error/httpErrors.js";

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
   try {
    const { data, error } = await resend.emails.send({
        from: `Support <onboarding@resend.dev>`, 
        to: [to],
        subject: subject,
        html: html,
    });

    if (error) {
        logger.error("Resend API Error:", error);
        throw new ServerError(error.message);
    }

    logger.info(`Email sent to ${to} via Resend. ID: ${data?.id}`);
    return data;
    
  } catch (error: any) {
    logger.error("Error sending email:", error);
    throw new ServerError("Failed to send email via Resend");
  }
}