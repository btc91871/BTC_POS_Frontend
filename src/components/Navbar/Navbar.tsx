import axios from "axios";
import "./Navbar.css";
import { FaBell, FaSearch, FaUser } from "react-icons/fa";
import { useEffect, useState } from "react";
import type { Entity } from "../Interface";

const API_URL = import.meta.env.VITE_API_URL;

interface NavbarProps {
  onDropdownChange: (value: Entity | null) => void;
}

const Navbar = ({ onDropdownChange }: NavbarProps) => {
  const defaultBtcEntity: Entity = {
    LEGALENTITYID: "BTC",
    NAME: "BTC",
    NAMEALIAS: "Born to Code",
  };

  const [entityList, setEntityList] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Load saved entity on mount
  useEffect(() => {
    async function getAllEntities() {
      try {
        const res = await axios.get<{ record: Entity[] }>(
          `${API_URL}/api/entities`
        );

        const entities = res.data.record || [];
        setEntityList(entities);

        // Check if we have a saved entity
        const savedEntityId = localStorage.getItem("EntityId");
        if (savedEntityId) {
          const found = entities.find((e) => e.LEGALENTITYID === savedEntityId);
          if (found) {
            setSelectedEntity(found);
            onDropdownChange(found);
            return;
          }
        }

        // fallback to default if no saved one
        setSelectedEntity(defaultBtcEntity);
        onDropdownChange(defaultBtcEntity);
      } catch (error) {
        console.error("Failed to fetch entities:", error);
      }
    }
    getAllEntities();
  }, []);

  const handleEntityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newEntity = entityList.find(
      (e) => e.LEGALENTITYID === event.target.value
    );

    setSelectedEntity(newEntity || null);
    onDropdownChange(newEntity || null);

    if (newEntity) {
      localStorage.setItem("EntityId", newEntity.NAME); // store ID instead of name
    }
  };

  return (
    <div className="navParent">
      <div className="left">
        <h1>logo</h1>
      </div>

      <div className="middle">
        <FaSearch />
        <input type="text" placeholder="Search.." />
      </div>

      <div className="right">
        <ul className="rightTab">
          <li>
            <select
              name="entities"
              id="entitySelect"
              value={selectedEntity?.LEGALENTITYID || ""}
              onChange={handleEntityChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                -- Select Entity --
              </option>
              {entityList.map((entity) => (
                <option key={entity.LEGALENTITYID} value={entity.LEGALENTITYID}>
                  {entity.NAMEALIAS || entity.NAME}
                </option>
              ))}
            </select>
          </li>

          <li>
            <FaBell />
          </li>
          <li>
            <FaUser />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
