import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const getUserById = async (id) => {
    const { data, error } = await supabase
        .from("tg_bot_users")
        .select("*")
        .eq("telegram_id", id)
        .single();
    return data;
};

export const createUser = async (user) => {
    const { data, error } = await supabase.from("tg_bot_users").insert([
        {
            telegram_id: user.id || null,
            created_at: new Date(),
            status: "active",
            username: user.username || null,
            first_name: user.first_name || null,
            last_name: user.last_name || null,
            photo_url: user.photo_url || null,
        },
    ]);

    return data;
};
