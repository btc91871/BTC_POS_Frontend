import { useState, useRef } from "react";
import "./Sidebar.css";
import { FaChevronUp, FaChevronDown, FaPlus, FaMinus } from "react-icons/fa";
import { CSSTransition } from "react-transition-group";
import { NavLink } from "react-router-dom";
import React from "react";

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      subItems: [
        { label: "Home", to: "/" },
        { label: "Analytics", to: "/analytics" },
        { label: "Reports", to: "/reports" },
      ],
    },
    {
      key: "profile",
      label: "Profile",
      subItems: [
        { label: "View Profile", to: "/view-profile" },
        { label: "Edit Profile", to: "/edit-profile" },
      ],
    },
    {
      key: "settings",
      label: "Settings",
      subItems: [
        { label: "General", to: "/general" },
        { label: "Security", to: "/security" },
        { label: "Notifications", to: "/notifications" },
      ],
    },
    {
      key: "companySetup",
      label: "Company Setup",
      subItems: [
        { label: "Legal Entity", to: "/legalEntity" },
        { label: "Data Import/Export", to: "/dataImportExport" },
        { label: "Sub Company", to: "/sub-company" },
        { label: "Add User", to: "/addUser" },
        { label: "Create Warehouse", to: "/addWareHouse" },
        { label: "Invent Location", to: "/inventLocation" },
        { label: "Add Site", to: "/addSite" },
        { label: "Add Vendor", to: "/addVendor" },
      ],
    },
    {
      key: "productInventory",
      label: "Product Inventory",
      subItems: [
        { label: "Product Master", to: "/productMaster" }
      ],
    }
  ];

  const nodeRefs = useRef(
    menuItems.reduce((acc, item) => {
      acc[item.key] = React.createRef<HTMLDivElement>();
      return acc;
    }, {} as { [key: string]: React.RefObject<HTMLDivElement | null> })
  );

  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  return (
    <div className="sidebar-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <p className="sidebar-kicker">Workspace</p>
          <h3 className="sidebar-title">Navigation</h3>
        </div>

        <ul className="sidebar-list">
          {menuItems.map((item) => (
            <li key={item.key} className="sidebar-item">
              <button
                className={`sidebar-button ${
                  openDropdown === item.key ? "is-open" : ""
                }`}
                onClick={() => toggleDropdown(item.key)}
                type="button"
              >
                <span>{item.label}</span>
                <span className="sidebar-chevron" aria-hidden="true">
                  {openDropdown === item.key ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </span>
              </button>

              <CSSTransition
                in={openDropdown === item.key}
                timeout={300}
                classNames="dropdown"
                unmountOnExit
                nodeRef={nodeRefs.current[item.key]}
              >
                <div ref={nodeRefs.current[item.key]}>
                  <ul className="submenu-list">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.to} className="submenu-item">
                        {subItem.label === "Sub Company" ? (
                          <button
                            className="special-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowModal(true);
                            }}
                          >
                            {subItem.label}
                          </button>
                        ) : (
                          <NavLink
                            to={subItem.to}
                            className={({ isActive }) =>
                              `submenu-link ${isActive ? "active" : ""}`
                            }
                            onClick={() => setOpenDropdown(null)}
                          >
                            {subItem.label}
                          </NavLink>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </CSSTransition>
            </li>
          ))}
        </ul>
      </aside>

      {showModal && (
        <div className="subcompany-modal">
          <div className="modal-content">Hello modal</div>
          <ul className="modal-actions-list">
            <li>
              <FaMinus /> Collapse all
            </li>
            <li>
              <FaPlus /> Expand all
            </li>
          </ul>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
