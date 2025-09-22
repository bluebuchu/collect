import sgMail from "@sendgrid/mail";

export class EmailService {
  private static instance: EmailService;
  private initialized = false;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  initialize() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.warn("SENDGRID_API_KEY not found. Email sending will be disabled.");
      return;
    }
    
    sgMail.setApiKey(apiKey);
    this.initialized = true;
  }

  async sendPasswordResetEmail(to: string, resetToken: string, userName?: string): Promise<boolean> {
    if (!this.initialized) {
      console.log(`[Email Service] Would send password reset email to ${to}`);
      console.log(`[Email Service] Reset token: ${resetToken}`);
      console.log(`[Email Service] Reset link: ${this.getResetLink(resetToken)}`);
      return true; // Simulate success in development
    }

    const resetLink = this.getResetLink(resetToken);
    
    // Use SendGrid Dynamic Template
    const templateId = process.env.SENDGRID_TEMPLATE_ID || 'd-dc980a06aeec4adf8bb41d452a942fec';
    
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@sentencecollector.com",
      templateId,
      dynamicTemplateData: {
        user_name: userName || to.split('@')[0], // Use nickname or email prefix
        reset_url: resetLink,
        expire_minutes: 60, // Token expires in 60 minutes
        app_name: '문장수집가'
      },
    };

    try {
      await sgMail.send(msg);
      console.log(`Password reset email sent to ${to}`);
      return true;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return false;
    }
  }

  private getResetLink(token: string): string {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return `${frontendUrl}/reset-password?token=${token}`;
  }

  // Legacy methods - kept for reference but not used with dynamic templates
  // These can be removed once dynamic template is fully tested
  /*
  private getPlainTextEmail(resetLink: string): string { ... }
  private getHtmlEmail(resetLink: string): string { ... }
  */
}

export const emailService = EmailService.getInstance();