import React from "react";


interface Address {
    partyType: number;
    partyID: string;
    address: string;
    addressType: number;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isActive: boolean;
}

interface SiteRecord {
    siteGUID: string;
    siteID: string;
    siteName: string;
    description: string;
    dataAreaID: string;
    createdBy: string;
    modifiedBy: string;
    addresses: Address[];
}
