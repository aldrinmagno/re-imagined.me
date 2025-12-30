import type { ApplicationRecord } from '../types/applications';
import type { ApplicationCommsPayload } from '../types/applicationComms';

const formatFollowUp = (application: ApplicationRecord) => {
  const company = application.company;
  const role = application.role_title;
  const contact = application.contact ? ` ${application.contact}` : '';
  return { company, role, contact };
};

export const generateApplicationComms = (
  application: ApplicationRecord,
  tone: 'direct' | 'warm' | 'confident'
): ApplicationCommsPayload => {
  const { company, role, contact } = formatFollowUp(application);
  const intro =
    tone === 'direct'
      ? `Hi${contact},`
      : tone === 'confident'
        ? `Hello${contact}!`
        : `Hi${contact}, hope you are doing well.`;

  const call_script = `${intro}\n\nI'm following up on my ${role} application with ${company}. I remain excited about the role and wanted to see if there is any additional information I can share to support the team.\n\nThanks for your time!`;

  const email_template = `Subject: ${role} application follow-up\n\n${intro}\n\nI wanted to follow up on my ${role} application submitted to ${company}. I'm enthusiastic about the opportunity and would welcome the chance to share any additional details or answer questions.\n\nThank you for your consideration,\n[Your Name]`;

  const linkedin_message = `${intro} I applied for the ${role} role at ${company} and wanted to share that I'm excited about the opportunity. If helpful, I'm happy to provide any additional context or examples of my work. Thanks!`;

  return { call_script, email_template, linkedin_message };
};
