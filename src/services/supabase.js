import { createClient } from "@supabase/supabase-js";
import { getPhotoUrlFromFileId } from "./grammy";
import { sendTgLog } from "./tg-logger";
import { platform } from "os";
import { send } from "process";

// Initialize Supabase client
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// USER

export const getUserById = async (id) => {
    let { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", id)
        .eq("onboarding", true)
        .single();

    if (data && data.photo) {
        const photoUrl = await getPhotoUrlFromFileId(data.photo);
        data.photo_url = photoUrl;
    }

    return data;
};

export const updateUser = async (tgUser, dbUser) => {
    let lastLoginDates = dbUser.last_login_date || [];
    lastLoginDates.push(new Date());

    const { data, error } = await supabase
        .from("users")
        .update([
            {
                username: tgUser.username || null,
                first_name: tgUser.first_name || null,
                last_name: tgUser.last_name || null,
                language_code: tgUser.language_code || null,
                is_premium: tgUser.is_premium ? true : false,
                platform: tgUser.platform || null,
                last_login_date: lastLoginDates,
            },
        ])
        .eq("telegram_id", tgUser.id);

    return data;
};

export const createUser = async (user, parent_id) => {
    const { data: dbUser, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", user.id);

    if (dbUser.length > 0) {
        const { data, error } = await supabase
            .from("users")
            .update([
                {
                    username: user.username || null,
                    first_name: user.first_name || null,
                    last_name: user.last_name || null,
                    language_code: user.language_code || null,
                    is_premium: user.is_premium ? true : false,
                    onboarding: true,
                    platform: user.platform || null,
                },
            ])
            .eq("telegram_id", user.id);

        if (dbUser[0].parent_id === null && parent_id) {
            const { data, error } = await supabase
                .from("users")
                .update([{ parent_id: parent_id }])
                .eq("telegram_id", user.id);
        }

        if (error) {
            console.error(error);
        }

        return data;
    }
    const { data, error } = await supabase.from("users").insert([
        {
            telegram_id: user.id || null,
            created_date: new Date(),
            username: user.username || null,
            first_name: user.first_name || null,
            last_name: user.last_name || null,
            language_code: user.language_code || null,
            is_premium: user.is_premium ? true : false,
            onboarding: true,
            platform: user.platform || null,
            parent_id: parent_id || null,
        },
    ]);

    if (error) {
        console.error(error);
    }

    console.log(data);

    return data;
};

export const addUserPhotoFileId = async (id, username, photo_url) => {
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", id);

    if (user && user?.length > 0) {
        const { data, error } = await supabase
            .from("users")
            .update({ photo: photo_url, username: username })
            .eq("telegram_id", id);

        return data;
    }

    const { data, error } = await supabase.from("users").insert({
        telegram_id: id,
        photo: photo_url,
        onboarding: false,
        username: username,
    });

    return data;
};

export const addReferrerToUser = async (id, username, referrer_id) => {
    const referrer = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", referrer_id)
    
    if (referrer?.data?.length == 0) {
        return;
    }

    const user = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", id)

    if (user.data.length > 0) {
        return
    }

    const newUser = await supabase.from("users").insert({
        telegram_id: id,
        username: username,
        parent_id: referrer_id,
        created_date: new Date(),
        onboarding: false,
    });

    return newUser.data;
};

// ORDERS

export const getOrderById = async (id) => {
    const { data: order, orderError } = await supabase
        .from("orders")
        .select(`*`)
        .eq("id", id)
        .eq("status", "CREATED")
        .order("created_at", { ascending: false });

    if (orderError || order.length === 0) {
        return [];
    }

    const { data: transactions, transactionError } = await supabase
        .from("transactions")
        .select(`checkout_id`)
        .eq("order_id", id);

    if (transactionError || transactions.length === 0) {
        return [];
    }

    return { ...order[0], checkout_id: transactions[0].checkout_id };
};

// STORIES

export const getStories = async () => {
    const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });

    return data;
};
