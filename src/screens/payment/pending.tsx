"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTelegram } from "@/providers/telegram-provider";

import Loader from "@/components/ui/loader";

export default function Pending() {
    const router = useRouter();
    const { user: tgUser, webApp } = useTelegram();

    useEffect(() => {
        if (webApp) {
            webApp?.BackButton.hide();

            setTimeout(() => {
                router.push("/esims/pay/success");
            }, 3000);
        }
    }, [webApp]);

    return (
        <main className="flex h-dvh flex-col items-center justify-center overflow-x-hidden ">
            <div className="flex flex-col items-center gap-4">
                <Loader />
            </div>
        </main>
    );
}