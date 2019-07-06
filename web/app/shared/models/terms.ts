export interface FE_TermsEditable {
    shortcode: string;
    version: string;
    languages: {
        [lang: string]: {
            name: string;
            url: string;
            text?: string;
        };
    };
}

export interface FE_MinimalTerms {
    name: string;
    text: string;
}