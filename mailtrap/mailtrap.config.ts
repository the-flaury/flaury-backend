import { MailtrapClient } from "mailtrap";

/**
 * For this example to work, you need to set up a sending domain,
 * and obtain a token that is authorized to send from the domain.
 */

const TOKEN = process.env.MAILTRAP_TOKEN as string;
const ENDPOINT = process.env.MAILTRAP_ENDPOINT!;
const SENDER = process.env.MAILTAP_SENDER!;

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});
export const sender = {
  name: "Flaury Business",
  email: "mailtrap@demomailtrap.com",
};
