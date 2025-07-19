
import { MailtrapClient } from "mailtrap";
// console.log("mailtrap ka token",process.env.MAILTRAP_TOKEN)
export const mailTrapClient = new MailtrapClient({
  token:"63b4276d8084dec2b3a44cd248e43110",
  
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};
