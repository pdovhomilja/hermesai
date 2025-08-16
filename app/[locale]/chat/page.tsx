import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ConversationList } from "@/components/chat/conversation-list";

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with conversation list */}
        <div className="lg:col-span-1">
          <ConversationList />
        </div>

        {/* Main chat interface */}
        <div className="lg:col-span-3">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}