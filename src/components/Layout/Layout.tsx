import "./layout.css";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import ImportExport from "../ImportExport/ImportExport";
import Home from "../Home/Home";
import { useState } from "react";
import AddEntity from "../Entity/AddEntity";
import AddUser from "../User/AddUser";
import type { Entity } from "../Interface";
import AddWarehouse from "../Warehouse/AddWarehouse";
import AddInventLocation from "../Warehouse/InventLocation/InventLocation";
import AddSite from "../Warehouse/Site/Site";
import AddVendor from "../Warehouse/Vendor/AddVendor";
import ProductMaster from "../Product/ProductMaster/ProductMaster";

const Layout = () => {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  const handleDropdownChange = (value: Entity | null) => {
    setSelectedEntity(value);
  };

  return (
    <section className="layout">
      <div className="header">
        <Navbar onDropdownChange={handleDropdownChange} />
      </div>
      <div className="leftSide">
        <Sidebar />
      </div>
      <div className="body">
        <Routes>
          <Route
            path="/"
            element={<Home selectedValue={selectedEntity?.NAME || ""} />}
          />
          <Route path="/dataImportExport" element={<ImportExport />} />
          <Route path="/legalEntity" element={<AddEntity />} />
          <Route path="/addUser" element={<AddUser />} />
          <Route path="/addWareHouse" element={<AddWarehouse />} />
          <Route path="/inventLocation" element={<AddInventLocation />} />
          <Route path="/addSite" element={<AddSite />} />
          <Route path="/addVendor" element={<AddVendor />} />
          <Route path="/productMaster" element={<ProductMaster />} />
        </Routes>
      </div>
    </section>
  );
};

export default Layout;
