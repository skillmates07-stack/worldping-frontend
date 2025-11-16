import { useClanMessages } from "@/hooks/useClanMessages";
import MessageCard from "../MessageFeed/MessageCard";

export default function ClanMessagesPanel({ clanId }: { clanId: string }) {
  const { messages, sendMessage } = useClanMessages(clanId);

  return (
    <div>
      <div className="space-y-3">
        {messages.map(msg => <MessageCard key={msg.id} {...msg} />)}
      </div>
      <form className="mt-2 flex" onSubmit={e => {/* see MessageFeed logic */}}>
        {/* drop in your MessageForm logic here */}
      </form>
    </div>
  );
}
