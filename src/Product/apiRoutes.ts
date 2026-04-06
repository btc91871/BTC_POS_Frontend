// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL: string = "http://192.168.0.108";


//  SIZE PAGE
export const SIZE_API = {
    GET_SIZE: `${API_BASE_URL}/api/Size/getAllSizes`,
    CREATE_SIZE: `${API_BASE_URL}/api/Size/createSize`,
    UPDATE_SIZE: `${API_BASE_URL}/api/Size/updateSizeById`,
    DELETE_SIZE: `${API_BASE_URL}/api/Size/DeleteSizeById`,
};  //IMPLEMENTED

//STYLE PAGE
export const STYLE_API = {
    GET_STYLE: `${API_BASE_URL}/api/Style/getAllStyles`,
    CREATE_STYLE: `${API_BASE_URL}/api/Style/createStyle`,
    UPDATE_STYLE: `${API_BASE_URL}/api/Style/updateStyleById`,
    DELETE_STYLE: `${API_BASE_URL}/api/Style/DeleteStyleById`,
}

export const ENUM_API = {
    GET_ENUMS: `${API_BASE_URL}/api/Enum`,
    CREATE_ENUM: `${API_BASE_URL}/api/Enum/create`,
    UPDATE_ENUM: `${API_BASE_URL}/api/Enum/update`,
    DELETE_ENUM: `${API_BASE_URL}/api/Enum`,
}

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
