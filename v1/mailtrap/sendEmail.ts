import { mailtrapClient, sender } from "./mailtrap.config";

interface IReceipient {
  email: string;
}
interface ISender {
  email: string;
  name?: string;
}

interface IProps {
  receipients: IReceipient[];
  sender: ISender;
  text?: string;
  html?: string;
  subject: string;
  category?: string;
}

export async function sendEmail({
  receipients,
  sender,
  text,
  html,
  subject,
  category,
}: IProps) {
  try {
    mailtrapClient
      .send({
        from: sender,
        to: receipients,
        subject,
        text,
        html,
        category,
      })
      .then(console.log, console.error);
  } catch (error: any) {
    console.log({ error: error.message });
  }
}
