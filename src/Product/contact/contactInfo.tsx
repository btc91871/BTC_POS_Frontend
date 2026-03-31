import React, { useState, useEffect } from "react";
import "./contactInfo.css";

interface Contact {
    id: number;
    description: string;
    contacT_TYPE: number;
    contacT_INFO: string;
    iS_PRIMARY: number;
    dataareaid: string;
    internationaL_CALLING_CODE: string;
    createD_BY: "3fa85f64-5717-4562-b3fc-2c963f66afa6";
    modifieD_BY: "3fa85f64-5717-4562-b3fc-2c963f66afa6";
}

const API_BASE_URL = "http://192.168.0.104";

const ContactPage: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [newRow, setNewRow] = useState({
        description: "",
        contacT_TYPE: 0,
        contacT_INFO: "",
        iS_PRIMARY: 0,
        internationaL_CALLING_CODE: ""
    });

    // 🔹 GET
    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        const res = await fetch(`${API_BASE_URL}/api/Contact/getByDataAreaID`);
        const data = await res.json();
        setContacts(data.data);
    };

    // 🔹 ADD
    const handleAdd = async () => {
        const payload = {
            ...newRow,
            dataareaid: "DAT",
            createD_BY: "user-id",
            modifieD_BY: "user-id"
        };

        console.log("Adding contact with payload:", payload);

        const res = await fetch(`${API_BASE_URL}/api/Contact/createContact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        setContacts(prev => [...prev, data]);

        setNewRow({
            description: "",
            contacT_TYPE: 0,
            contacT_INFO: "",
            iS_PRIMARY: 0,
            internationaL_CALLING_CODE: ""
        });
    };


    // 🔹 UPDATE
    const handleUpdate = async (contact: Contact) => {
        await fetch(`${API_BASE_URL}/api/Contact/update/${contact.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contact)
        });

        fetchContacts();
    };

    // 🔹 DELETE
    const handleDelete = async (id: number) => {
        await fetch(`${API_BASE_URL}/api/Contact/${id}`, { method: "DELETE" });
        setContacts(prev => prev.filter(c => c.id !== id));
    };

    // 🔹 CHANGE
    const handleChange = (id: number, field: keyof Contact, value: any) => {
        setContacts(prev =>
            prev.map(c =>
                c.id === id ? { ...c, [field]: value } : c
            )
        );
    };

    return (
        <div className="contact-container">
            <h2>Contact Information</h2>

            <div className="toolbar">
                <button onClick={handleAdd}>+ Add</button>
            </div>

            <table className="contact-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Contact</th>
                        <th>Code</th>
                        <th>Primary</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    {/* 🔥 INLINE ADD ROW */}
                    <tr>
                        <td>
                            <input
                                value={newRow.description}
                                onChange={e =>
                                    setNewRow({ ...newRow, description: e.target.value })
                                }
                            />
                        </td>

                        <td>
                            <select
                                value={newRow.contacT_TYPE}
                                onChange={e =>
                                    setNewRow({ ...newRow, contacT_TYPE: Number(e.target.value) })
                                }
                            >
                                <option value={0}>Phone</option>
                                <option value={1}>Email</option>
                            </select>
                        </td>

                        <td>
                            <input
                                value={newRow.contacT_INFO}
                                onChange={e =>
                                    setNewRow({ ...newRow, contacT_INFO: e.target.value })
                                }
                            />
                        </td>

                        <td>
                            <input
                                value={newRow.internationaL_CALLING_CODE}
                                onChange={e =>
                                    setNewRow({ ...newRow, internationaL_CALLING_CODE: e.target.value })
                                }
                            />
                        </td>

                        <td>
                            <input
                                type="checkbox"
                                checked={newRow.iS_PRIMARY === 1}
                                onChange={e =>
                                    setNewRow({ ...newRow, iS_PRIMARY: e.target.checked ? 1 : 0 })
                                }
                            />
                        </td>

                        <td>
                            <button onClick={handleAdd}>Add</button>
                        </td>
                    </tr>

                    {/* 🔽 DATA ROWS */}
                    {contacts.map(c => (
                        <tr
                            key={c.id}
                            className={selectedId === c.id ? "active-row" : ""}
                            onClick={() => setSelectedId(c.id)}
                        >
                            <td>
                                <input
                                    value={c.description}
                                    onChange={e => handleChange(c.id, "description", e.target.value)}
                                />
                            </td>

                            <td>
                                <select
                                    value={c.contacT_TYPE}
                                    onChange={e => handleChange(c.id, "contacT_TYPE", Number(e.target.value))}
                                >
                                    <option value={0}>Phone</option>
                                    <option value={1}>Email</option>
                                </select>
                            </td>

                            <td>
                                <input
                                    value={c.contacT_INFO}
                                    onChange={e => handleChange(c.id, "contacT_INFO", e.target.value)}
                                />
                            </td>

                            <td>
                                <input
                                    value={c.internationaL_CALLING_CODE}
                                    onChange={e => handleChange(c.id, "internationaL_CALLING_CODE", e.target.value)}
                                />
                            </td>

                            <td>
                                <input
                                    type="checkbox"
                                    checked={c.iS_PRIMARY === 1}
                                    onChange={e => handleChange(c.id, "iS_PRIMARY", e.target.checked ? 1 : 0)}
                                />
                            </td>

                            <td>
                                <button onClick={() => handleUpdate(c)}>Save</button>
                                <button onClick={() => handleDelete(c.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}

                </tbody>
            </table>
        </div>
    );
};

export default ContactPage;