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




