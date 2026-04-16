// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL: string = "http://192.168.0.106";


//  SIZE PAGE
export const SIZE_API = {
    GET_SIZE: `${API_BASE_URL}/api/Size/getAllSizes`,
    CREATE_SIZE: `${API_BASE_URL}/api/Size/createSize`,
    UPDATE_SIZE: `${API_BASE_URL}/api/Size/updateSizeById`,
    DELETE_SIZE: `${API_BASE_URL}/api/Size/DeleteSizeById`,
};  //IMPLEMENTED 

//Size group
export const SIZE_GROUP = {
    GET_ALL: `${API_BASE_URL}/api/Size/GetSizeGroupsWithLine`,
    GET_ID: `${API_BASE_URL}/api/Size/getSizeGroupById`,
    CREATE: `${API_BASE_URL}/api/Size/createSizeGroupNdLine`,
    UPDATE: `${API_BASE_URL}/api/Size/updateSizeGroupById`,
    DELETE: `${API_BASE_URL}/api/Size/DeleteSizeGroupById`,
    DELETE_LINE: `${API_BASE_URL}/api/Size/DeleteSizeGroupLineById`,

}

// export const SIZE_LINE = {
//     GET_SIZE_LINE: `${API_BASE_URL}/api/Size/GetSizeGroupsWithLine`,
//     CREATE_SIZE_LINE: `${API_BASE_URL}/api/Size/createSizeGroupNdLine`,
//     // UPDATE_SIZE_LINE: `${API_BASE_URL}/api/Size/updateSizeLineById`,
//     DELETE_SIZE_LINE: `${API_BASE_URL}/api/Size/DeleteSizeGroupLineById`,
// }


// STYLE PAGE
export const STYLE_API = {
    GET_STYLE: `${API_BASE_URL}/api/Style/getAllStyles`,
    CREATE_STYLE: `${API_BASE_URL}/api/Style/createStyle`,
    UPDATE_STYLE: `${API_BASE_URL}/api/Style/updateStyleById`,
    DELETE_STYLE: `${API_BASE_URL}/api/Style/DeleteStyleById`,
}

// Style group
export const STYLE_GROUP = {
    GET_ALL: `${API_BASE_URL}/api/Style/GetStyleGroupsWithLines`,
    GET_ID: `${API_BASE_URL}/api/Style/GetStyleGroupById`,
    CREATE: `${API_BASE_URL}/api/Style/createStyleGroupNdLines`,
    UPDATE: `${API_BASE_URL}/api/Style/updateStyleGroupById`,
    DELETE: `${API_BASE_URL}/api/Style/DeleteStyleById`,
    DELETE_LINE: `${API_BASE_URL}/api/Style/DeleteStyleGroupLineById`,
}

//ENUM PAGE

export const ENUM_API = {
    GET_ENUMS: `${API_BASE_URL}/api/Enum/all`,
    CREATE_ENUM: `${API_BASE_URL}/api/Enum/create`,
    UPDATE_ENUM: `${API_BASE_URL}/api/Enum/update`,
    DELETE_ENUM: `${API_BASE_URL}/api/Enum`,
}

// CONTACT PAGE
export const CONTACT_API = {
    GET_CONTACTS: `${API_BASE_URL}/api/Contact/GetContactInfoByDataAreaId`,
    CREATE_CONTACT: `${API_BASE_URL}/api/Contact/createContact`,
    UPDATE_CONTACT: `${API_BASE_URL}/api/Contact/updateContactById`,
    DELETE_CONTACT: `${API_BASE_URL}/api/Contact/DeleteContactInfoById`,
}

export const SITE_API = {
    GET_SITES: `${API_BASE_URL}/api/Site/GetByDataAreaID`,
    CREATE_SITE: `${API_BASE_URL}/api/Site/create`,
    UPDATE_SITE: `${API_BASE_URL}/api/Site/updateSiteById`,
    DELETE_SITE: `${API_BASE_URL}/api/Site/DeleteSiteById`,
}

export const UNIT_API = {
    GET_UNITS: `${API_BASE_URL}/api/Unit/GetAllUnits`,
    CREATE_UNIT: `${API_BASE_URL}/api/Unit/createUnit`,
    UPDATE_UNIT: `${API_BASE_URL}/api/Unit/updateUnitById`,
    DELETE_UNIT: `${API_BASE_URL}/api/Unit/DeleteUnit`,
}


export const Storage_API = {
    GET_ALL: `${API_BASE_URL}/api/StorageDimension/GetAllStorageDimesion`,
    GET_BY_ID: `${API_BASE_URL}/api/StorageDimension/GetStorageDimesionById`,
    CREATE: `${API_BASE_URL}/api/StorageDimension/createStorageDimensionGroup`,
    UPDATE: `${API_BASE_URL}/api/StorageDimension/updateStorageDimensionById`,
    DELETE_GRP: `${API_BASE_URL}/api/StorageDimension/DeleteStorageDimensionById`,
    DELETE_LINE: `${API_BASE_URL}/api/StorageDimension/DeleteStorageDimensionLineById`,
};