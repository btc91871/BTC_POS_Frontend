// import React from "react";
// import "./StyleForm.css";

// interface StyleFormData {
//     style: string;
//     stylename: string;
//     styledescription: string;
//     styledisplayorder: number;
//     stylerefinergroup: string;
//     hexcode: string;
//     url: string;
// }

// interface Props {
//     formData: StyleFormData;
//     formError: string;
//     onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     onSave: () => void;
//     onCancel: () => void;
// }

// const StyleForm: React.FC<Props> = ({
//     formData,
//     formError,
//     onChange,
//     onSave,
//     onCancel,
// }) => {
//     return (
//         <div className="overlay">
//             <div className="modal">

//                 <h2>Add Style</h2>

//                 <div className="formGroup">
//                     <label>Style</label>
//                     <input
//                         name="style"
//                         value={formData.style}
//                         onChange={onChange}
//                         className="input"
//                     />
//                 </div>

//                 <div className="formGroup">
//                     <label>Style Name</label>
//                     <input
//                         name="stylename"
//                         value={formData.stylename}
//                         onChange={onChange}
//                         className="input"
//                     />
//                 </div>

//                 <div className="formGroup">
//                     <label>Refiner Group</label>
//                     <input
//                         name="stylerefinergroup"
//                         value={formData.stylerefinergroup}
//                         onChange={onChange}
//                         className="input"
//                     />
//                 </div>

//                 {formError && <div className="errorBar">{formError}</div>}

//                 <div className="buttonRow">
//                     <button className="btnPrimary" onClick={onSave}>
//                         Save
//                     </button>

//                     <button className="btnSecondary" onClick={onCancel}>
//                         Cancel
//                     </button>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default StyleForm;





import React from "react";
import "./styleForm.css";

interface StyleRecord {
    style: string;
    stylename: string;
    styledescription: string;
    styledisplayorder: number;
    stylerefinergroup: string;
    hexcode: string;
    url: string;
}

interface Props {
    row: StyleRecord;
    index: number;
    onChange: (
        index: number,
        field: keyof StyleRecord,
        value: string
    ) => void;
}

const StyleForm: React.FC<Props> = ({ row, index, onChange }) => {
    return (
        <tr>
            <td>
                <input
                    value={row.style}
                    onChange={(e) => onChange(index, "style", e.target.value)}
                />
            </td>

            <td>
                <input
                    type="number"
                    value={row.styledisplayorder}
                    onChange={(e) =>
                        onChange(index, "styledisplayorder", e.target.value)
                    }
                />
            </td>

            <td>
                <input
                    value={row.hexcode}
                    onChange={(e) => onChange(index, "hexcode", e.target.value)}
                />
            </td>

            <td>
                <input
                    value={row.url}
                    onChange={(e) => onChange(index, "url", e.target.value)}
                />
            </td>

            <td>
                <input
                    value={row.stylerefinergroup}
                    onChange={(e) =>
                        onChange(index, "stylerefinergroup", e.target.value)
                    }
                />
            </td>

        </tr>
    );
};

export default StyleForm;