export interface FormData {
  NAME: string;
  NAMEALIAS: string;
  SEARCHNAME: string;
  DESCRIPTION: string;
  PARTYNUMBER: string;
  BANKNAME: string;
  ACCOUNTNO: string;
  IFSC: string;
  PARTYTYPE: string;
  MODIFIEDBY: string;
  MODIFIEDDATETIME: string;
  ADDRESSES: Address[];
  PRIMARYCONTACTPHONE: string;
  PRIMARYCONTACTPHONEDESCRIPTION: string;
  DASHBOARDIMAGE: string | ArrayBuffer | null;
  LOGO: string | ArrayBuffer | null;
  TAXREGISTRATIONNO: string;
  PANNO: string;
  COUNTRY: string;
  CREATEDBY: string;
}

export interface Address {
  NAME: string;
  FULLPRIMARYADDRESS: string;
  PURPOSE: string;
  ISPRIMARY: boolean;
  ADDRESSZIPCODE: string;
  ADDRESSCITY: string;
  ADDRESSTIMEZONE: string;
}

export interface USER {
  NAME: string;
  PHONE: string;
  EMAIL: string;
  GENDER: string;

  ADDRESS: USERADDRESS[];
  LEGALENTITYID: string;
  ID: string;
  PASSWORD: string;
  IMAGE: string;
}

export interface USERADDRESS {
  CUSTOMERID: string;
  STATE: string;
  COUNTRY: string;
  PURPOSE: string;
  ISPRIMARY: false;
  ADDRESS: string;
}

export interface Entity {
  NAMEALIAS: string;
  NAME: string;
  LEGALENTITYID: string;
}

export interface NavbarProps {
  onDropdownChange: (value: string) => void;
}

export interface Warehouse {
  WAREHOUSE: string;
  NAME: string;
  SITE: string;
  TYPE: string;
  QUARANTINE_WAREHOUSE: string;
  TRANSIT_WAREHOUSE: string;
  VENDOR_ACCOUNT: string;
  DEFAULT_RETURN_LOCATION: string;
  DEFAULT_LOCATION: string;
  MAIN_WAREHOUSE: string;
  ADDRESSES?: WarehouseAddress[];
}

export interface WarehouseAddress {
  NAME: string;
  ADDRESS: string;
  PURPOSE: string;
  PRIMARY_FLAG: boolean;
  CITY: string;
}

export interface Vendor {
  VENDORACCOUNT: string;
  NAME: string;
  VENDORHOLD: number;
  PHONE: string;
  EXTENSION: string;
  PRIMARYCONTACT: string;
  VENDORGROUP: string;
  CURRENCY: string;
}

export interface InventLocation {
  WAREHOUSE: string;
  LOCATION: string;
  LOCATIONTYPE: string;
  CURRENTVOLUME: number;
  CURRENTWEIGHT: number;
  AVAILABLEVOLUME: number;
  AVAILABLEWEIGHT: number;
  MAXVOLUME: number;
  MAXWEIGHT: number;
  DATAAREAID: string;
}

export interface LocationType {
  LOCATIONTYPE: string;
  LOCATIONID: string;
}

export interface SITE {
  NAME: string;
  SITE?: string;
  LEGALENTITYID?: string;
  ADDRESS: SITEADDRESS[];
}

export interface SITEADDRESS {
  NAME: string;
  ADDRESS: string;
  PURPOSE: string;
  PRIMARY: false;
  DATAAREAID: string;
}

export interface VENDOR {
  NAME: string;
  VENDORHOLD: string;
  PHONE: string;
  PRIMARYCONTACT: string;
  VENDORGROUP: string;
  CURRENCY: string;
}

export interface VENDORGROUPCATEGORY {
  NAME: string;
  DESCRIPTION: string;
  ID: string;
  DATAAREAID: string;
}

export interface CURRENCY {
  NAME: string;
  CODE: string;
}

export interface INVENTLOCATION {
  WAREHOUSE: string;
  LOCATION: string;
  LOCATIONTYPE: string;
}

export interface GetAllBankDetails {
  NAME: string;
  ACCOUNTNO: string;
  IFSC: string;
}
export interface Gender {
  GENDER: string;
}

export interface Vendor {
  VENDORACCOUNT: string;
  NAME: string;
  VENDORHOLD: string;
  PHONE: string;
  EXTENSION: string;
  PRIMARYCONTACT: string;
  VENDORGROUP: string;
  CURRENCY: string;
  LEGALENTITYID: string;
}

export interface LOCATIONTYPE {
  LOCATIONID: string;
  LOCATIONTYPE: string;
}

export interface SITE {
  NAME: string;
  SITEID: string;
}

export interface VENDORGROUPCATEGORY {
  NAME: string;
  DESCRIPTION: string;
  ID: string;
  DATAAREAID: string;
}

export interface CURRENCY {
  NAME: string;
  CODE: string;
}

export interface INVENTLOCATION {
  WAREHOUSE: string;
  LOCATION: string;
  LOCATIONTYPE: string;
}
