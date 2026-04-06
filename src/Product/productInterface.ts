export interface SizeGroup {
    id?: string;
    SIZEGROUPNAME: string;
    SIZEGROUPDESCRIPTION: string;
    CREATEDBY: string;
    MODIFIEDBY: string;
    Lines: SizeLinegroups[];
}

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


export interface SizeLinegroups {
    Guid: String;
    SIZE: string;
    NUMBERINBARCODE: string;
    SIZEGROUPLINEDISPLAYORDER: number;
    CREATEDBY: string;
    MODIFIEDBY: string;
}



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