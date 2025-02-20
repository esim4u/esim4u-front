import React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/types";

const PremiumIcon = ({ className, onClick }: Icon) => {
    return (
        <div onClick={onClick} className={cn("h-5 w-5", className)}>
            <svg
                className="aspect-square h-full w-full"
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M10.7327 3.20006C11.2365 2.12653 12.7635 2.12653 13.2673 3.20006L15.3908 7.72406C15.5892 8.14669 15.9852 8.44263 16.4467 8.51314L21.3067 9.25568C22.4331 9.42778 22.8931 10.8017 22.0973 11.6173L18.4934 15.311C18.1831 15.629 18.0422 16.0755 18.1138 16.5141L18.9523 21.6546C19.1404 22.808 17.916 23.6706 16.8932 23.1052L12.6773 20.7747C12.2558 20.5417 11.7442 20.5417 11.3227 20.7747L7.10678 23.1052C6.08399 23.6706 4.85959 22.808 5.04774 21.6546L5.27904 20.2366C5.28754 20.1845 5.29858 20.1341 5.31398 20.0836C5.44315 19.66 6.13321 17.5494 7.3 16.7C9.04138 15.6036 11.3394 14.3618 12.7517 13.6182C12.9574 13.5099 12.843 13.1784 12.6144 13.2204C10.701 13.5721 7.35506 14.1458 5.74836 14.174C5.66736 14.1754 5.58911 14.169 5.51015 14.1509C4.5003 13.9197 3.31538 12.9971 3.05311 12.7854C3.01695 12.7562 2.98374 12.7253 2.95129 12.692L1.90271 11.6173C1.10693 10.8017 1.56688 9.42778 2.69332 9.25568L7.55332 8.51314C8.01484 8.44263 8.41084 8.14669 8.60921 7.72405L10.7327 3.20006Z"
                    fill="url(#paint0_linear_2001_2374)"
                />
                <defs>
                    <linearGradient
                        id="paint0_linear_2001_2374"
                        x1="19.7028"
                        y1="2.84722"
                        x2="3.92006"
                        y2="21.9779"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#DB75E4" />
                        <stop offset="1" stopColor="#6C6AD2" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default PremiumIcon;
