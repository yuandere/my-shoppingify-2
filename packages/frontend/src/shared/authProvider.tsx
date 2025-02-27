import { ReactNode, useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/shared/supabaseClient";
import { AuthContext } from "./AuthContext";
import { demo_categories, demo_items, demo_lists } from "@/lib/demo-data";

const useAuthQuery = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      try {
        const { data } = await supabase.auth.getSession();
        return data.session?.user ?? null;
      } catch {
        return null;
      }
    },
    retry: false,
  });
};

const clearLocalStorage = () => {
  [window.localStorage, window.sessionStorage].forEach((storage) => {
    Object.entries(storage).forEach(([key]) => {
      storage.removeItem(key);
    });
  });
};

const populateDemoData = async (userId: string) => {
  try {
    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .insert(
        demo_categories.map((cat) => ({
          name: cat.name,
          user_id: userId,
        }))
      )
      .select();
    if (categoryError) throw categoryError;
    const categoryMap = new Map(
      categories?.map((cat) => [cat.name, cat.id]) ?? []
    );
    const { data: items, error: itemError } = await supabase
      .from("items")
      .insert(
        demo_items.map((item) => ({
          name: item.name,
          description: item.description ?? null,
          image_url: item.image_url ?? null,
          category_id: categoryMap.get(item.category_name) ?? null,
          category_name: item.category_name ?? null,
          user_id: userId,
        }))
      )
      .select();
    if (itemError) throw itemError;
    const itemMap = new Map(
      items?.map((item) => [
        item.name,
        { id: item.id, category_name: item.category_name },
      ]) ?? []
    );
    for (const list of demo_lists) {
      const { data: listData, error: listError } = await supabase
        .from("lists")
        .insert({
          name: list.name,
          user_id: userId,
          completed: false,
        })
        .select()
        .single();
      if (listError) throw listError;
      const listItems = list.items.map((itemName) => ({
        list_id: listData.id,
        item_id: itemMap.get(itemName)?.id ?? null,
        name: itemName,
        quantity: 1,
        checked: false,
        user_id: userId,
        category_name: itemMap.get(itemName)?.category_name ?? null,
      }));
			const { error: listItemError } = await supabase
        .from("list_items")
        .insert(listItems)
      if (listItemError) throw listItemError;
    }
  } catch (error) {
    console.error("Error populating demo data:", error);
    throw error;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useAuthQuery();

  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(
    undefined
  );
  const isInitializing =
    isLoading || isFetching || isAuthenticated === undefined;

  const handleStoreAuth = useCallback(
    (user: User | null) => {
      setUser(user);
      queryClient.setQueryData(["auth"], user);
      setIsAuthenticated(!!user);
    },
    [queryClient]
  );

  const loginWithEmail = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: import.meta.env.VITE_EMAIL_REDIRECT_TO,
      },
    });
    if (error) throw new Error(error.message);
    handleStoreAuth(data.user);
  };

  const loginWithDemo = async (captchaToken: string) => {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        captchaToken,
      },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("User not found");
    await populateDemoData(data.user.id);
    handleStoreAuth(data.user);
    return data.user;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    handleStoreAuth(null);
  };

  const verifyOtp = async (tokenHash: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });
    if (error) throw new Error(error.message);
    handleStoreAuth(data.user);
  };

  const contextValue = {
    isAuthenticated,
    user,
    handleStoreAuth,
    loginWithDemo,
    loginWithEmail,
    logout,
    verifyOtp,
  };

  useEffect(() => {
    if (data !== undefined) {
      handleStoreAuth(data);
    }
  }, [data, handleStoreAuth]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AUTHEVENT", event);
      console.log("AUTHSESSION", session);
      handleStoreAuth(session?.user ?? null);
      if (event === "INITIAL_SESSION") {
        // handle initial session
        // const urlParams = new URLSearchParams(window.location.search);
        // const tokenHash = urlParams.get('token_hash');
        // if (tokenHash) {
        // 	verifyOtp(tokenHash);
        // }
      } else if (event === "SIGNED_IN" && session) {
        // handle signed in
      } else if (event === "SIGNED_OUT") {
        clearLocalStorage();
      } else if (event === "TOKEN_REFRESHED") {
        // handle token refreshed event
      } else if (event === "USER_UPDATED") {
        // handle user updated event
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [handleStoreAuth]);

  return (
    <AuthContext.Provider value={{ ...contextValue, isInitializing }}>
      {isInitializing ? null : children}
    </AuthContext.Provider>
  );
}
