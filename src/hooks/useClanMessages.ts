import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// Basic hook for fetching and subscribing to clan messages
export function useClanMessages(clanId: string) {
  const [messages, setMessages] = useState([]);
  
  // Fetch initial messages
  useEffect(() => {
    if (!clanId) return;
    supabase
      .from("clan_messages")
      .select("*")
      .eq("clan_id", clanId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data ?? []));
  }, [clanId]);
  
  // Real-time subscription
  useEffect(() => {
    if (!clanId) return;
    const channel = supabase
      .channel(`clan-messages-${clanId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "clan_messages", filter: `clan_id=eq.${clanId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      );
    channel.subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [clanId]);
  
  // Send message
  const sendMessage = useCallback(async (content: string, emoji?: string, attachments?: any) => {
    await supabase
      .from("clan_messages")
      .insert([{ clan_id: clanId, content, emoji, attachments }]);
  }, [clanId]);
  
  return { messages, sendMessage };
}
