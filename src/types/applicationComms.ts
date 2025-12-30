export type ApplicationCommType = 'call_script' | 'email_template' | 'linkedin_message';

export type ApplicationCommRecord = {
  id: string;
  application_id: string;
  user_id: string;
  type: ApplicationCommType;
  content: string;
  created_at: string;
};

export type ApplicationCommsPayload = {
  call_script: string;
  email_template: string;
  linkedin_message: string;
};
