import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase/client'


export function useClanDiscovery(query: string) {
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("clans")
        .select("*")
        .ilike("name", `%${query}%`)
        .order("member_count", { ascending: false })
        .limit(20);
      setClans(data ?? []);
      setLoading(false);
    })();
  }, [query]);

  return { clans, loading };
}
