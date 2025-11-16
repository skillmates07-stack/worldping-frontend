import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

// Define the Clan interface matching your database schema
interface Clan {
  id: string;
  name: string;
  emoji?: string;
  member_count?: number;
  privacy?: string;
  description?: string;
  created_at?: string;
  // Add any other fields from your clans table
}

export function useClanDiscovery(query: string) {
  const [clans, setClans] = useState<Clan[]>([]); // Explicit typing
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("clans")
          .select("*")
          .ilike("name", `%${query}%`)
          .order("member_count", { ascending: false })
          .limit(20);

        if (error) throw error;
        setClans(data ?? []);
      } catch (err) {
        console.error("Error fetching clans:", err);
        setClans([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [query]);

  return { clans, loading };
}
