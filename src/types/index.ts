import { ESIM_STATE, ORDER_STATUS } from "@/enums";

export interface Esim {
    iccid: string;
    coverage: string;
    image_url: string;
    state: ESIM_STATE;
    validity: string;
    data: string;
    sm_dp: string;
    confirmation_code: string;
    type: string;
    usage: {
        remaining: number;
        total: number;
    };
    expired_at: string;
}

// types.ts
export interface ITelegramUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    language_code: string;
    photo_url: string;
}

export interface IWebApp {
    initData: string;
    initDataUnsafe: {
        query_id: string;
        user: ITelegramUser;
        auth_date: string;
        hash: string;
    };
    version: string;
    platform: string;
    colorScheme: string;
    themeParams: {
        link_color: string;
        button_color: string;
        button_text_color: string;
        secondary_bg_color: string;
        hint_color: string;
        bg_color: string;
        text_color: string;
    };
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    isClosingConfirmationEnabled: boolean;
    headerColor: string;
    backgroundColor: string;
    BackButton: {
        isVisible: boolean;
    };
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isProgressVisible: boolean;
        isActive: boolean;
    };
    HapticFeedback: any;
}


export interface Translations {
    [language: string]: {
        [key: string]: string;
    };
}