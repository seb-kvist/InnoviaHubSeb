import React, { useEffect, useState } from "react";
import { getAllResources, changeResourceStatus } from "../api/api";
import type { Resource } from "../Interfaces/types";
import ResourceCard from "./ResourceCard";
import resourceData from "../data/resourceData";

interface Props {
  token: string;
}

const ResourcesTab: React.FC<Props> = ({ token }) => {

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [expandedTypes, setExpandedTypes] = useState<string[]>([]); // track expanded groups
  const [selectedResource, setSelectedResource] = useState<string>("");

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const data = await getAllResources(token);
        setResources(data);
      } catch {
        setError("Kunde inte ladda resurser");
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, [token]);


  const mergedResources: Resource[] = resources.map((r) => {
    const fullData = resourceData.find((rd) => rd.id === r.resourceTypeId);
    return {
      ...r,
      name: fullData?.name ?? "Unknown",
      description: fullData?.description ?? "",
      imageUrl: fullData?.imageUrl ?? "",
      path: fullData?.path ?? "",
      resourceType: fullData?.name ?? "Unknown",
    };
  });
useEffect(()=>{
  if(mergedResources.length>0 && !selectedResource){
    setSelectedResource(mergedResources[0].resourceType)
  }
}),[mergedResources, selectedResource]

  const toggleResourceStatus = async (id: number) => {
    try {
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, updating: true } : r))
      );

      await changeResourceStatus(id, token);

      setResources((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, isBookable: !r.isBookable, updating: false } : r
        )
      );
    } catch {
      alert("Kunde inte ändra resursstatus");
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, updating: false } : r))
      );
    }
  };

  if (loading) return <p>Laddar resurser...</p>;
  if (error) return <p className="error">{error}</p>;
  if (resources.length === 0) return <p>Inga resurser hittades</p>;

  // Group resources by type
  const resourcesByType: Record<string, Resource[]> = {};
  mergedResources.forEach((r) => {
    if (!resourcesByType[r.resourceType]) resourcesByType[r.resourceType] = [];
    resourcesByType[r.resourceType].push(r);
  });


  return (
    <div className="resources-tab">
      {/* Vänsterkolumn: aktiv */}
      <div className="left-column">
        {Object.entries(resourcesByType)
          .filter(([type]) => selectedResource === type)
          .map(([type, resList]) => (
            <div key={type} className="resource-group active">
              {/* Group header */}
              <div
                className="resource-group-header"
                onClick={() => setSelectedResource(type)}
              >
                <img
                  src={resList[0].imageUrl}
                  alt={type}
                  className="resource-group-icon"
                />
                <span>{type}</span>
              </div>
  
              {/* Group resources */}
              <div className="resource-group-list">
                {resList.map((r) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    onToggle={toggleResourceStatus}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
  
      {/* Högerkolumn: icke-aktiva */}
      <div className="right-column">
        {Object.entries(resourcesByType)
          .filter(([type]) => selectedResource !== type)
          .map(([type, resList]) => (
            <div key={type} className="resource-group">
              {/* Group header */}
              <div
                className="resource-group-header"
                onClick={() => setSelectedResource(type)}
              >
                <img
                  src={resList[0].imageUrl}
                  alt={type}
                  className="resource-group-icon"
                />
                <span>{type}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
  
};

export default ResourcesTab;
