import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useJoinedClans() {
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    async function fetchClans() {
      setLoading(true);
      // Replace with your method to get the current user's device_id
      const currentDeviceId = typeof window !== "undefined" ? localStorage.getItem("deviceId") : "";
      if (!currentDeviceId) {
        setClans([]);
        setLoading(false);
        return;
      }
      const { data: memberships, error } = await supabase
        .from("clan_members")
        .select("clan_id, clans:clan_id(*)")
        .eq("device_id", currentDeviceId);
      if (!mounted) return;
      if (error) {
        setClans([]);
      } else {
        // You can add unread count logic here
        setClans(memberships.map(m => ({
          ...m.clans,
          unread: 0, // Optionally add unread message logic per clan
        })));
      }
      setLoading(false);
    }
    fetchClans();
    return () => { mounted = false; };
  }, []);
  
  return { clans, loading };
}
