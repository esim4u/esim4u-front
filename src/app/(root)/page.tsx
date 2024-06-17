"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTelegram } from "@/providers/telegram-provider";
import {
    getUserById,
    updateUser,
    updateUserActivity,
} from "@/services/supabase";

import Loader from "@/components/ui/loader";
import { sendTgLog } from "@/services/tg-logger";

export default function IndexPage() {
    const router = useRouter();
    const urlParams = new URLSearchParams(window.location.search);
    const newsletter = urlParams.get("newsletter");

    const { user: tgUser, webApp, start_param } = useTelegram();

    const fetchUser = async (id: number | string) => {
        const dbUser = await getUserById(id);

        if (dbUser?.id) {
            if (newsletter) {
                const res = await updateUserActivity({
                    telegram_id: tgUser.id,
                    newsletter_id: newsletter,
                    story_id: null,
                });
                await sendTgLog(`User ${tgUser.id} checkedF to newsletter ${newsletter}`);
            }
            await updateUser(tgUser, dbUser);
            return router.push("/esims");
        }

        return router.push("/onboarding");
    };

    useEffect(() => {
        if (tgUser && webApp) {
            fetchUser(tgUser.id);
        }
    }, [tgUser]);

    return (
        <main className="flex h-dvh flex-col items-center justify-center overflow-x-hidden ">
            <Loader />
        </main>
    );
}
