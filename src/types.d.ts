export interface Message {
  _id: string;
  text: string;
  role: "User" | "Bot";
  _created_at: Date;
}
