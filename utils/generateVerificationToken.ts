export default function generateVerificationToken() {
  const token = Math.floor(Math.random() * 999999);
  return token;
}
