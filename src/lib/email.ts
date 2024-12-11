type EmailOptions = {
  to: string | string[];
  subject: string;
  body: string;
};

export async function sendEmail({ to, subject, body }: EmailOptions) {
  // Implement your email sending logic here
  // For now, we'll just log it
  console.log('Email would be sent:', { to, subject, body });
  return true;
} 