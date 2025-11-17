// src/components/AuthButton.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export function AuthButton() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setShow(false); // close modal after login
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  if (user) return <div className="text-white px-4 py-2">Signed in as {user.email || 'user'}</div>;

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium"
      >
        Sign In
      </button>
      {show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[100]">
          <div className="bg-gray-900 p-6 rounded-lg" onClick={e => e.stopPropagation()}>
            <Auth
              supabaseClient={supabase}
              providers={["google"]}
              appearance={{ theme: ThemeSupa }}
              onlyThirdPartyProviders
              theme="dark"
            />
            <button onClick={() => setShow(false)} className="mt-4 text-pink-500 hover:underline">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
