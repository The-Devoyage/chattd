export interface Message {
  _id: string;
  text: string;
  role: "User" | "Bot";
}
