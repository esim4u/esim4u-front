"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { COUNTRIES } from "@/constants";
import { useTelegram } from "@/providers/telegram-provider";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { MdArrowForwardIos } from "react-icons/md";

import { convertUsdToPreferredCurrency } from "@/lib/currency";
import { l } from "@/lib/locale";
import { cn, getAccentColor, hapticFeedback } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import Collapse from "@/components/ui/collapse";
import Dot from "@/components/ui/dot";
import Loader from "@/components/ui/loader";
import { TonIcon } from "@/components/icons";
import OneTimeInstallationWarning from "@/components/esims/one-time-installation-warning";

const Package = ({ params }: { params: { country_code: string } }) => {
    const router = useRouter();
    const path = usePathname();

    const { user: tgUser, webApp } = useTelegram();
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [terms, setTerms] = useState({
        terms1: false,
        terms2: false,
    });

    const {
        data: packageData,
        isLoading,
        isFetched,
    } = useQuery({
        queryKey: ["esim-packages", params.country_code],
        queryFn: async () => {
            const { data } = await axios.get(
                "/api/esims/packages/" + params.country_code,
            );
            return data[0];
        },
        placeholderData: keepPreviousData,
    });

    const { data: rateTonUsd } = useQuery({
        queryKey: ["ratetonusd"],
        queryFn: async () => {
            const { data } = await axios.get(
                "https://tonapi.io/v2/rates?tokens=ton&currencies=usd",
            );
            return data.rates.TON.prices.USD;
        },
        refetchInterval: 1000 * 10, // 10 sec
    });

    const { data: preferredCurrencyPrice } = useQuery({
        queryKey: ["preferredCurrencyPrice", selectedPackage?.total_price],
        queryFn: async () => {
            return await convertUsdToPreferredCurrency(
                selectedPackage?.total_price,
            );
        },
        enabled: !!selectedPackage?.total_price,
        placeholderData: keepPreviousData,
    });

    useEffect(() => {
        if (webApp) {
            webApp?.MainButton.show();

            webApp?.BackButton.show();
        }
    }, [webApp]);

    useEffect(() => {
        webApp?.onEvent("backButtonClicked", goBack);
        return () => {
            webApp?.offEvent("backButtonClicked", goBack);
        };
    }, [webApp]);

    const goBack = useCallback(() => {
        hapticFeedback("heavy");
        router.back();
    }, [webApp]);

    useEffect(() => {
        if (terms.terms1 && terms.terms2) {
            webApp?.MainButton.setParams({
                text: l("btn_pay"),
                color: getAccentColor(),
                is_active: true,
                is_visible: true,
            });
        } else {
            webApp?.MainButton.setParams({
                text: l("btn_pay"),
                color: "#444444",
                is_active: false,
                is_visible: true,
            });
        }
    }, [terms]);

    useEffect(() => {
        if (isFetched && packageData) {
            setSelectedPackage(packagePlans[0]);
        }
    }, [isFetched, packageData]);

    const createEsimOrder = useCallback(async () => {
        hapticFeedback();
        await axios
            .post("/api/esims/create", {
                net_price: selectedPackage.net_price,
                original_price: selectedPackage.price,
                total_price: selectedPackage.total_price,
                total_price_eur: selectedPackage.total_price_eur,
                total_price_ton: priceInTon,
                telegram_id: tgUser?.id,
                package_id: selectedPackage.id,
                coverage: packageData.title,
                image_url: packageData.image.url,
                validity: selectedPackage.day,
                data: selectedPackage.data,
            })
            .then((res) => {
                console.log(res);
                if (res?.data?.order_id) {
                    router.push(`/esims/pay/${res.data.order_id}`);
                }
            });
    }, [selectedPackage, rateTonUsd]);

    useEffect(() => {
        webApp?.offEvent("mainButtonClicked");

        webApp?.onEvent("mainButtonClicked", createEsimOrder);
        return () => {
            webApp?.offEvent("mainButtonClicked", createEsimOrder);
        };
    }, [selectedPackage, rateTonUsd]);

    const packagePlans = useMemo(() => {
        if (!packageData || !packageData.operators) return [];

        //TODO: show operator with most amount of packages
        return packageData.operators[0].packages;
    }, [packageData]);

    const priceInTon = useMemo(() => {
        if (!rateTonUsd) return 999;

        const priceInTon = selectedPackage?.total_price / rateTonUsd;
        return priceInTon.toFixed(3);
    }, [rateTonUsd, selectedPackage]);

    if (isLoading) {
        return (
            <main className="flex h-dvh flex-col items-center justify-center overflow-x-hidden ">
                <Loader />
            </main>
        );
    }

    return (
        <section className="flex flex-col">
            <div className="relative -mb-6 flex flex-col items-center justify-center">
                <Image
                    width={200}
                    height={100}
                    className="h-48 w-full overflow-hidden rounded-lg object-cover"
                    src={"/img/countries/global.png"}
                    placeholder="blur"
                    blurDataURL={"/img/countries/global.png"}
                    alt={packageData.slug}
                />
                {/* <div className="absolute h-2/3 bg-gradient-to-t bottom-0 w-full backdrop-blur-lg blur-lg linear-mask"></div> */}
                <div className="absolute bottom-0 h-2/3 w-full bg-gradient-to-t from-black/75 "></div>

                <h1 className="absolute bottom-4 pb-6 text-center text-2xl uppercase text-white  shadow-black/50 text-shadow-sm ">
                    {packageData.slug}
                </h1>
            </div>
            <div className="z-10 flex flex-col gap-4 rounded-t-3xl bg-[#EFEFF3] p-5">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold">
                            {preferredCurrencyPrice?.amount}
                            <span className="text-2xl">
                                {preferredCurrencyPrice?.symbol}
                            </span>
                        </h2>
                        {/* <Dot />
                        <h2 className="font-bold text-3xl">
                            {selectedPackage?.total_price}
                            <span className="text-2xl">$</span>
                        </h2> */}
                        <Dot />
                        <h2 className="flex items-center text-3xl font-bold">
                            {priceInTon}
                            <TonIcon className="h-6 w-6" />
                        </h2>
                    </div>
                    <PriceCarousel
                        packageData={packageData}
                        packagePlans={packagePlans}
                        selectedPackage={selectedPackage}
                        setSelectedPackage={setSelectedPackage}
                    />
                </div>
                <AdditionalInfo packageData={packageData} />
                <Manual />
                <OneTimeInstallationWarning />
                <Terms terms={terms} setTerms={setTerms} />
            </div>
        </section>
    );
};

export default Package;

const PriceCarousel = ({
    packageData,
    packagePlans,
    selectedPackage,
    setSelectedPackage,
}: {
    packageData: any;
    packagePlans: any[];
    selectedPackage: any;
    setSelectedPackage: any;
}) => {
    const [api, setApi] = useState<CarouselApi>();
    useEffect(() => {
        if (!api) {
            return;
        }

        api.on("select", () => {
            console.log("selected", api.selectedScrollSnap());
        });
    }, [api]);

    return (
        <div className={cn("flex flex-col gap-1", "-mx-5")}>
            <h2
                className={cn(
                    "pl-2 text-sm font-medium uppercase text-neutral-500",
                    "px-7",
                )}
            >
                {l("title_packages")}
            </h2>
            <Carousel setApi={setApi}>
                <CarouselContent className={cn("ml-1", "mr-4 pl-4")}>
                    {packageData &&
                        packagePlans.map((plan: any, index: number) => {
                            return (
                                <CarouselItem
                                    key={index}
                                    className="basis-[122px] cursor-pointer pl-1"
                                >
                                    <div
                                        onClick={() => {
                                            hapticFeedback();
                                            setSelectedPackage(plan);
                                            api?.scrollTo(index);
                                        }}
                                        className={cn(
                                            "flex h-16  w-28 flex-col items-center justify-center rounded-3xl  border-[2px] border-neutral-400 p-5 transition-all active:border-4 active:border-tgaccent ",
                                            selectedPackage === plan &&
                                                "border-4 border-tgaccent",
                                        )}
                                    >
                                        <h2 className="text-2xl font-bold">
                                            {plan.amount / 1024}
                                            <span className="text-xl">GB</span>
                                        </h2>
                                        {/* <h2 className="text-center font-bold">
                                        {plan.data}
                                    </h2> */}
                                        <p className=" text-xs font-medium text-neutral-500">
                                            {plan.day} {l("text_days")}
                                        </p>
                                    </div>
                                </CarouselItem>
                            );
                        })}
                </CarouselContent>
            </Carousel>
        </div>
    );
};

const AdditionalInfo = ({ packageData }: { packageData: any }) => {
    const router = useRouter();
    const path = usePathname();

    return (
        <div className=" flex flex-col gap-2 rounded-2xl bg-white  p-5 shadow-md">
            <h2 className="pl-1 text-xs font-medium uppercase text-neutral-500">
                {l("title_information")}
            </h2>

            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-sm font-bold capitalize">
                        {l("label_coverage")}
                    </h3>
                    {packageData.operators[0].coverages.length > 1 ? (
                        <button
                            onClick={() => {
                                hapticFeedback();
                                router.push(`${path}/coverage`);
                            }}
                            className="text-sm font-medium capitalize text-tgaccent underline underline-offset-2"
                        >
                            {packageData.operators[0].coverages.length}{" "}
                            {l("text_countries")}
                        </button>
                    ) : (
                        <h3 className="text-sm font-bold">
                            {COUNTRIES[
                                packageData.operators[0].coverages[0].name.toLowerCase()
                            ] || packageData.operators[0].coverages[0].name}
                        </h3>
                    )}
                </div>
                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-sm font-bold capitalize">
                        {l("label_plan")}
                    </h3>
                    <h3 className="text-sm font-bold capitalize">
                        {packageData.operators[0].plan_type && l("text_plan")}
                    </h3>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-sm font-bold capitalize">
                        {l("label_top_up")}
                    </h3>
                    <h3 className="text-sm font-bold capitalize">
                        {packageData.operators[0].rechargeability
                            ? l("text_top_up")
                            : "Not available"}
                    </h3>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-sm font-bold capitalize">
                        {l("label_compatible_devices")}
                    </h3>
                    <button
                        onClick={() => {
                            hapticFeedback();
                            router.push(`/esims/compatible-devices`);
                        }}
                        className="text-sm font-medium capitalize text-tgaccent underline underline-offset-2"
                    >
                        {l("text_compatible_devices")}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Manual = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className=" flex flex-col rounded-2xl bg-white p-5 shadow-md">
            <div
                className="flex cursor-pointer items-center justify-between"
                onClick={() => {
                    hapticFeedback();
                    setIsOpen(!isOpen);
                }}
            >
                <h2 className="flex cursor-pointer items-center gap-1 text-xs font-medium uppercase text-neutral-500">
                    {l("title_guide")}
                    <Badge className="capitalize ">{l("badge_guide")}</Badge>
                </h2>
                <MdArrowForwardIos
                    className={cn(
                        "text-neutral-500 transition-transform",
                        isOpen && " rotate-90",
                    )}
                />
            </div>

            <Collapse isOpen={isOpen}>
                <div className="flex flex-col gap-2 pt-2 text-sm font-bold">
                    <div className="flex flex-row gap-2">
                        <h3 className="w-4">1.</h3>
                        <h3 className="">{l("instruction_1")}</h3>
                    </div>
                    <div className="flex flex-row gap-2">
                        <h3 className="w-4">2.</h3>
                        <h3 className="text-sm">{l("instruction_2")}</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2">
                            <h3 className="w-4">3.</h3>
                            <h3 className="text-sm">{l("instruction_3")}</h3>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="py-2 pl-4">
                                <Dot className="size-1.5" />
                            </div>
                            <h3 className="text-sm">
                                {l("instruction_3_auto")}
                            </h3>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="py-2 pl-4">
                                <Dot className="size-1.5" />
                            </div>
                            <h3 className="text-sm">{l("instruction_3_qr")}</h3>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="py-2 pl-4">
                                <Dot className="size-1.5" />
                            </div>
                            <h3 className="text-sm">
                                {l("instruction_3_manual")}
                            </h3>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <h3 className="w-4">4.</h3>
                        <h3 className="text-sm">{l("instruction_4")}</h3>
                    </div>
                    <div className="flex flex-row gap-2">
                        <h3 className="w-4"> 5. </h3>
                        <h3 className="text-sm">{l("instruction_5")}</h3>
                    </div>
                </div>
            </Collapse>
        </div>
    );
};

const Terms = ({ terms, setTerms }: { terms: any; setTerms: any }) => {
    return (
        <div className="flex flex-col gap-2 rounded-3xl border-2 border-redish p-5">
            <div
                onClick={() => {
                    hapticFeedback();
                }}
                className="flex items-center space-x-2"
            >
                <Checkbox
                    onCheckedChange={(checked: boolean) => {
                        setTerms({
                            ...terms,
                            terms1: checked,
                        });
                    }}
                    checked={terms.terms1}
                    id="terms1"
                />
                <label
                    htmlFor="terms1"
                    className="cursor-pointer text-sm font-medium "
                >
                    {l("text_terms_conditions")}
                </label>
            </div>
            <div
                onClick={() => {
                    hapticFeedback();
                }}
                className=" flex items-center space-x-2"
            >
                <Checkbox
                    onCheckedChange={(checked: boolean) => {
                        setTerms({
                            ...terms,
                            terms2: checked,
                        });
                    }}
                    checked={terms.terms2}
                    id="terms2"
                />
                <label
                    htmlFor="terms2"
                    className="cursor-pointer text-sm font-medium "
                >
                    {l("text_device_compatible")}
                </label>
            </div>
        </div>
    );
};
