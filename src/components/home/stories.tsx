"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTelegram } from "@/providers/telegram-provider";
import {
    getStories,
    incrementStoryTotalViews,
    incrementStoryUniqueViews,
} from "@/services/supabase";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { cn, hapticFeedback } from "@/lib/utils";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";

import { Skeleton } from "../ui/skeleton";

type Props = {
    className?: string;
};

const Stories = ({ className }: Props) => {
    const { webApp } = useTelegram();
    const [checkedStories, setCheckedStories] = useState<string[]>([]);

    const { data: stories, isLoading } = useQuery({
        queryKey: ["stories"],
        queryFn: async () => {
            const data = await getStories();
            return data;
        },
        placeholderData: keepPreviousData,
    });

    useEffect(() => {
        if (webApp) {
            webApp?.CloudStorage?.getItem(
                "checked_stories",
                (err: any, result: any) => {
                    if (err) {
                        return null;
                    }
                    const arrayFromString = result.split(",");
                    setCheckedStories(arrayFromString);
                },
            );
        }
    }, [webApp]);

    if (isLoading)
        return (
            <div>
                <Carousel className="w-full">
                    <CarouselContent className={cn("-ml-1", className)}>
                        {Array(4)
                            .fill(null)
                            .map((placeholder, index) => {
                                return (
                                    <CarouselItem
                                        key={index}
                                        className="basis-24  cursor-pointer pl-1 transition-transform active:scale-95 "
                                    >
                                        <div className="p-1">
                                            <div
                                                className={cn(
                                                    "rounded-full bg-neutral-400/15 p-1 transition-all",
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "relative  flex aspect-square items-end justify-center overflow-hidden rounded-full ring-2 ring-[#EFEFF3] ",
                                                    )}
                                                >
                                                    <div>
                                                        <Skeleton className="h-full w-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                );
                            })}
                    </CarouselContent>
                </Carousel>
            </div>
        );

    return (
        <div>
            <Carousel className="w-full">
                <CarouselContent className={cn("-ml-1", className)}>
                    {stories?.map((story, index) => {
                        return (
                            <CarouselItem
                                key={index}
                                onClick={async () => {
                                    await incrementStoryTotalViews(story.id);

                                    if (
                                        !checkedStories.includes(
                                            story.id.toString().trim(),
                                        )
                                    ) {
                                        await incrementStoryUniqueViews(
                                            story.id,
                                        );
                                    }

                                    webApp?.openLink(story.telegraph_url, {
                                        try_instant_view: true,
                                    });
                                    hapticFeedback();

                                    let unique = new Set([
                                        ...checkedStories,
                                        story.id.toString().trim(),
                                    ]);
                                    const newCheckedStories =
                                        Array.from(unique);

                                    setCheckedStories(newCheckedStories);

                                    webApp?.CloudStorage.setItem(
                                        "checked_stories",
                                        newCheckedStories.join(","),
                                    );
                                }}
                                className="basis-24  cursor-pointer pl-1 transition-transform active:scale-95"
                            >
                                <div className="p-1">
                                    <div
                                        className={cn(
                                            "rounded-full p-1 transition-all",
                                            checkedStories.length > 0 &&
                                                !checkedStories.includes(
                                                    story.id.toString().trim(),
                                                )
                                                ? " bg-gradient-to-tr from-pink-500  via-sky-500 to-emerald-500"
                                                : "bg-neutral-400/15",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "relative  flex aspect-square items-end justify-center overflow-hidden rounded-full ring-2 ring-[#EFEFF3] ",
                                            )}
                                        >
                                            <div className="relative h-full w-full">
                                                <Image
                                                    width={216}
                                                    height={216}
                                                    className=" h-full w-full object-cover"
                                                    placeholder="blur"
                                                    blurDataURL={
                                                        story?.photo_url
                                                    }
                                                    quality={25}
                                                    src={story?.photo_url}
                                                    alt="news"
                                                />
                                                <div className="absolute bottom-0 h-2/3 w-full bg-gradient-to-t from-black/55">
                                                    {" "}
                                                </div>
                                            </div>

                                            <span className="absolute pb-2 text-center text-[10px] font-medium uppercase leading-3 text-white shadow-black text-shadow ">
                                                {story?.title}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
            </Carousel>
        </div>
    );
};

export default Stories;
