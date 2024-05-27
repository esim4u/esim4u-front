"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getPreferredLanguage, setLanguage } from "@/lib/locale";
import { hapticFeedback } from "@/lib/utils";
import { useTelegram } from "@/providers/telegram-provider";
import { getUserById } from "@/services/supabase";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Settings() {
    const router = useRouter();
    const { user: tgUser, webApp } = useTelegram();
    const [preferredLang, setPreferredLang] = useState();

    const { data: dbUserData, isLoading } = useQuery({
        queryKey: ["user", tgUser?.id],
        queryFn: async () => {
            const data = await getUserById(tgUser.id);
            return data;
        },
    });

    useEffect(() => {
        if (webApp) {
            webApp?.BackButton.show();
        }
    }, [webApp]);

    return (
        <main className="overflow-x-hidden h-dvh flex flex-col justify-center items-center w-full p-5">
            <div className="flex flex-col items-center gap-4 w-full">
                <div className=" flex gap-2 w-full">
                    {" "}
                    {["developer", "admin"].includes(
                        dbUserData?.badge.toLowerCase()
                    ) && (
                        <Button
                            onClick={() => {
                                hapticFeedback();
                                router.push("/profile/sensitive-info");
                            }}
                            variant={"destructive"}
                            className="rounded-full w-full"
                        >
                            Sensitive info
                        </Button>
                    )}
                    <Button
                        onClick={() => {
                            hapticFeedback();
                            router.push("/sandbox");
                        }}
                        variant={"destructive"}
                        className="rounded-full w-full"
                    >
                        Sandbox
                    </Button>
                </div>

                <div className="flex gap-2 w-full">
                    <Button
                        onClick={() => {
                            hapticFeedback();
                            router.push("/onboarding");
                        }}
                        className="rounded-full w-full"
                    >
                        Repeat onboarding
                    </Button>

                    <Button
                        onClick={() => {
                            webApp?.openTelegramLink(
                                "https://t.me/esim4u_support_bot/chat"
                            );
                        }}
                        className="rounded-full w-full"
                    >
                        open support
                    </Button>
                </div>
                <Select
                    onValueChange={(value) => {
                        setLanguage(value, router);
                    }}
                    defaultValue={getPreferredLanguage()}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="uk">Ukrainian</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hu">Hungarian</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </main>
    );
}
