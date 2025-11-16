import { useState, useEffect } from "react";

interface Clan {
  id: string;
  name: string;
  emoji?: string;
  member_count?: number;
  privacy?: string;
}

export function useClanDiscovery(query: string) {
  const [clans, setClans] = useState<Clan[]>([]);
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
