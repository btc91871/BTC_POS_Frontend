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
    GUID: string;
    SIZEGROUPNAME: string;
    SIZEGROUPDESCRIPTION: string;
    CREATEDBY: string;
    MODIFIEDBY: string;
    Lines: SizeLinegroups[];
}
export interface SizeLinegroups {
    Guid: String;
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
    id?: string;
    stylegroupname: string;
    stylegroupdescription: string;
    createdby: string;
    modifiedby: string;
    lines: StyleGroupLine[];
}

export interface StyleGroupLine {
    style: string;
    numberinbarcode: string;
    stylegrouplinedisplayorder: number;
    createdby: string;
    modifiedby: string;
}



