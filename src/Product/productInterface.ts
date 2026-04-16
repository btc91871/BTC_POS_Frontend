// only SIZE
export interface SizeRecord {
    GUID: string;
    SIZE: string;
    SIZENAME: string;
    SIZEDESCRIPTION: string;
    SIZEDISPLAYORDER: number;
    SIZEREFINERGROUP: string;
    hexcode: string;
    url: string;
}

// Size Group   xxxxxxxxxxx
export interface SizeGroup {
    Guid: string;
    SIZEGROUPNAME: string;
    SIZEGROUPDESCRIPTION: string;
    CREATEDBY: string;
    MODIFIEDBY: string;
    Lines: SizeLinegroups[];
}
export interface SizeLinegroups {
    Guid: String;
    SIZEGROUP: string;
    SIZE: string;
    NUMBERINBARCODE: string;
    SIZEGROUPLINEDISPLAYORDER: number;
    CREATEDBY: string;
    MODIFIEDBY: string;
}


// only STYLE
export interface StyleRecord {
    GUID: string;
    STYLE: string;
    STYLENAME: string;
    STYLEDESCRIPTION: string;
    STYLEDISPLAYORDER: number;
    STYLEREFINERGROUP: string;
    hexcode: string;
    url: string;
}

// Style Group xxxxxxxxxxxx
export interface StyleGroup {
    Guid: string;
    STYLEGROUPNAME: string;
    STYLEGROUPDESCRIPTION: string;
    CREATEDBY: string;
    MODIFIEDBY: string;
    Lines: StyleGroupLine[];
}
export interface StyleGroupLine {
    STYLE: string;
    NUMBERINBARCODE: string;
    STYLEGROUPLINEDISPLAYORDER: number;
    CREATEDBY: string;
    MODIFIEDBY: string;
}

export interface UnitRecord {
    GUID: string;
    UNIT: string;
    DATAAREAID: string;
    DESCRIPTION: string;
    UNITCLASS: number;
    ISBASEUNIT: number;
    MODIFIEDBY: string;
    CREATEDBY: string;

}




export interface StorageLine {
    Guid: string;
    STORAGEDIMENSIONGROUPID: string;
    ENUMVALUE: number;        // the number that identifies the dimension (Site=0, WH=1 …)
    ISACTIVE: boolean;
    ISBLOTRECEIPTALLOWED: boolean;
    ISBLANKISSUEALLOWED: boolean;
    ISPHYSICALINVENTORY: boolean;
    ISFINANCIALINVENTORY: boolean;
    ISCOVERAGEPLAN: boolean;
    ISFORPURCHASEPRICES: boolean;
    ISFORSALESPRICES: boolean;
    ISTRANSFER: boolean;
    DISPLAYORDER: number;
    DATAAREAID: string;
    CREATEDBY: string;
    CREATEDDATETIME: string;
    MODIFIEDBY: string;
    MODIFIEDDATETIME: string;
    EnumDetail: { MEMBERNAME: string; VALUE: number } | null;
}

// The "header" — one Storage Dimension Group
export interface StorageGroup {
    Guid: string;
    STORAGEDIMGROUPNAME: string;
    STORAGEDIMGROUPDESC: string;
    DATAAREAID: string;
    CREATEDBY: string;
    CREATEDDATETIME: string;
    MODIFIEDBY: string;
    MODIFIEDDATETIME: string;
    Lines: StorageLine[];
}