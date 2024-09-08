import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

const statusMapping = {
  D0: "Negative",
  D1: "Positive",
  A0: "Resectable",
  A1: "Borderline",
  A2: "Locally Advanced",
  A9: "Resectable",
  V0: "Resectable",
  V1: "Borderline",
  V2: "Locally Advanced",
  V9: "Resectable",
  I0: "Resectable",
  I1: "Borderline",
  I2: "Locally Advanced",
  I9: "Resectable",
  VAR1: "Present",
  VAR9: "Absent",
  LN0: "Negative",
  LN1: "Indeterminate",
  LN2: "Positive",
  H0: "Negative",
  H1: "Indeterminate",
  H2: "Positive",
  P0: "Negative",
  P1: "Indeterminate",
  P2: "Positive"
};

const getResectabilityStatus = (statuses) => {
  if (statuses.some(s => s === "A2" || s === "V2" || s === "I2")) return "Locally Advanced";
  if (statuses.some(s => s === "A1" || s === "V1" || s === "I1")) return "Borderline";
  return "Resectable";
};

const getMetastasisStatus = (statuses) => {
  if (statuses.some(s => s === "LN2" || s === "H2" || s === "P2")) return "Unresectable";
  if (statuses.some(s => s === "LN1" || s === "H1" || s === "P1")) return "Indeterminate";
  return "Resectable";
};

const getOverallResectability = (vascular, metastasis) => {
  if (vascular === "Locally Advanced" || metastasis === "Unresectable") return "Unresectable";
  if (metastasis === "Indeterminate") {
    return vascular === "Borderline" ? "Potentially Borderline" : "Potentially Resectable";
  }
  return vascular;
};

const StatusLabel = ({ status, children, noBackground = false }) => {
  if (noBackground) {
    return <span>{children}</span>;
  }
  const bgColor = status === "Resectable" || status === "Negative" ? "bg-green-200" :
                  status === "Borderline" || status === "Indeterminate" || 
                  status === "Potentially Borderline" || status === "Potentially Resectable" ? "bg-yellow-200" :
                  "bg-red-200";
  return <span className={`${bgColor} px-2 py-1 rounded`}>{children}</span>;
};

const SafeStatusLabel = ({ data, path, noBackground = false }) => {
  const value = path.split('.').reduce((obj, key) => obj && obj[key], data);
  if (value && value.status) {
    const mappedStatus = statusMapping[value.status] || value.status;
    return <StatusLabel status={mappedStatus} noBackground={noBackground}>{mappedStatus}</StatusLabel>;
  }
  return <StatusLabel status="N/A" noBackground={noBackground}>N/A</StatusLabel>;
};

const PancreasCancerReport = ({ data }) => {
  console.log("PancreasCancerReport data:", data);
  console.log("Artery data:", data.artery);
  const getStatusDisplay = (statusCode) => {
    return statusMapping[statusCode] || statusCode || 'N/A';
  };
  
  const vascularStatuses = [
    data.artery?.celiac_axis?.status,
    data.artery?.common_hepatic_artery?.status,
    data.artery?.superior_mesenteric_artery?.status,
    data.vein?.main_portal_vein?.status,
    data.vein?.superior_mesenteric_vein?.status,
    data.inferior_vena_cava?.status,
    data.aorta?.status
  ].filter(Boolean);
  const vascularResectability = getResectabilityStatus(vascularStatuses);

  const metastasisStatuses = [
    data.distant_lymph_node?.status,
    data.final_hematogenous_metastasis_status,
    data.final_peritoneal_seeding_status
  ].filter(Boolean);
  const metastasisStatus = getMetastasisStatus(metastasisStatuses);

  const overallResectability = getOverallResectability(vascularResectability, metastasisStatus);

  const getResectabilityCauses = () => {
    if (overallResectability === "Unresectable") {
      const causes = [];
      if (vascularResectability === "Locally Advanced") causes.push("Vascular Involvement");
      if (data.distant_lymph_node?.status === "LN2") causes.push("Distant Lymph Node Involvement");
      if (data.final_hematogenous_metastasis_status === "H2") causes.push("Hematogenous Metastasis");
      if (data.final_peritoneal_seeding_status === "P2") causes.push("Peritoneal Seeding");
      return causes;
    } else if (overallResectability === "Borderline") {
      return ["Vascular Involvement"];
    } else if (overallResectability === "Potentially Borderline" || overallResectability === "Potentially Resectable") {
      const causes = [];
      if (data.distant_lymph_node?.status === "LN1") causes.push("Indeterminate Distant Lymph Node Involvement");
      if (data.final_hematogenous_metastasis_status === "H1") causes.push("Indeterminate Hematogenous Metastasis");
      if (data.final_peritoneal_seeding_status === "P1") causes.push("Indeterminate Peritoneal Seeding");
      return causes;
    }
    return [];
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tumor Characteristics</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Location:</strong> {data.tumor_location || 'N/A'}</p>
          <p><strong>Size:</strong> {data.tumor_size ? `${data.tumor_size} cm` : 'N/A'}</p>
          <p><strong>Morphology:</strong> {data.tumor_morphology || 'N/A'}</p>
          <p><strong>Adjacent Organ Invasion:</strong> {data.adjacent_organ_invasion || 'N/A'}</p>
          <p><strong>Main Pancreatic Duct:</strong> <SafeStatusLabel data={data} path="main_pancreatic_duct" noBackground={true} />
            {data.main_pancreatic_duct?.status !== "D0" && <span className="block pl-4 text-sm">{data.main_pancreatic_duct?.ref}</span>}
          </p>
          <p><strong>Bile Duct:</strong> <SafeStatusLabel data={data} path="bile_duct" noBackground={true} />
            {data.bile_duct?.status !== "D0" && <span className="block pl-4 text-sm">{data.bile_duct?.ref}</span>}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vascular Involvement</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Arterial Variations:</strong> <SafeStatusLabel data={data} path="arterial_variations" noBackground={true} />
            {data.arterial_variations?.status !== "VAR9" && data.arterial_variations?.ref && <span className="block pl-4 text-sm">{data.arterial_variations.ref}</span>}
          </p>
          <p><strong>Celiac Axis:</strong> <SafeStatusLabel data={data} path="artery.celiac_axis" />
            {data.artery?.celiac_axis?.status !== "A0" && data.artery?.celiac_axis?.status !== "A9" && data.artery?.celiac_axis?.ref && <span className="block pl-4 text-sm">{data.artery.celiac_axis.ref}</span>}
          </p>
          <p><strong>Common Hepatic Artery:</strong> <SafeStatusLabel data={data} path="artery.common_hepatic_artery" />
            {data.artery?.common_hepatic_artery?.status !== "A0" && data.artery?.common_hepatic_artery?.status !== "A9" && data.artery?.common_hepatic_artery?.ref && <span className="block pl-4 text-sm">{data.artery.common_hepatic_artery.ref}</span>}
          </p>
          <p><strong>Superior Mesenteric Artery:</strong> <SafeStatusLabel data={data} path="artery.superior_mesenteric_artery" />
            {data.artery?.superior_mesenteric_artery?.status !== "A0" && data.artery?.superior_mesenteric_artery?.status !== "A9" && data.artery?.superior_mesenteric_artery?.ref && <span className="block pl-4 text-sm">{data.artery.superior_mesenteric_artery.ref}</span>}
          </p>
          <p><strong>Main Portal Vein:</strong> <StatusLabel status={getStatusDisplay(data.vein?.main_portal_vein?.status)}>{getStatusDisplay(data.vein?.main_portal_vein?.status)}</StatusLabel>
            {data.vein?.main_portal_vein?.status !== "V0" && data.vein?.main_portal_vein?.status !== "V9" && data.vein?.main_portal_vein?.ref && <span className="block pl-4 text-sm">{data.vein.main_portal_vein.ref}</span>}
          </p>
          <p><strong>Superior Mesenteric Vein:</strong> <StatusLabel status={getStatusDisplay(data.vein?.superior_mesenteric_vein?.status)}>{getStatusDisplay(data.vein?.superior_mesenteric_vein?.status)}</StatusLabel>
            {data.vein?.superior_mesenteric_vein?.status !== "V0" && data.vein?.superior_mesenteric_vein?.status !== "V9" && data.vein?.superior_mesenteric_vein?.ref && <span className="block pl-4 text-sm">{data.vein.superior_mesenteric_vein.ref}</span>}
          </p>
          <p><strong>Inferior Vena Cava:</strong> <StatusLabel status={getStatusDisplay(data.inferior_vena_cava?.status)}>{getStatusDisplay(data.inferior_vena_cava?.status)}</StatusLabel>
            {data.inferior_vena_cava?.status !== "I0" && data.inferior_vena_cava?.status !== "I9" && data.inferior_vena_cava?.ref && <span className="block pl-4 text-sm">{data.inferior_vena_cava.ref}</span>}
          </p>
          <p><strong>Aorta:</strong> <StatusLabel status={getStatusDisplay(data.aorta?.status)}>{getStatusDisplay(data.aorta?.status)}</StatusLabel>
            {data.aorta?.status !== "A0" && data.aorta?.status !== "A9" && data.aorta?.ref && <span className="block pl-4 text-sm">{data.aorta.ref}</span>}
          </p>
          <p><strong>Resectability:</strong> <StatusLabel status={vascularResectability}>{vascularResectability}</StatusLabel></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metastasis</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Regional Lymph Nodes:</strong> <SafeStatusLabel data={data} path="regional_lymph_node" />
            {data.regional_lymph_node?.status !== "LN0" && <span className="block pl-4 text-sm">{data.regional_lymph_node?.ref}</span>}
          </p>
          <p><strong>Distant Lymph Nodes:</strong> <SafeStatusLabel data={data} path="distant_lymph_node" />
            {data.distant_lymph_node?.status !== "LN0" && <span className="block pl-4 text-sm">{data.distant_lymph_node?.ref}</span>}
          </p>
          <p><strong>Hematogenous Metastasis:</strong> {data.final_hematogenous_metastasis_status ? <StatusLabel status={statusMapping[data.final_hematogenous_metastasis_status]}>{statusMapping[data.final_hematogenous_metastasis_status]}</StatusLabel> : 'N/A'}
            {data.final_hematogenous_metastasis_status !== "H0" && data.hematogenous_metastasis && 
              <span className="block pl-4 text-sm">{data.hematogenous_metastasis}</span>
            }
          </p>
          <p><strong>Peritoneal Seeding:</strong> {data.final_peritoneal_seeding_status ? <StatusLabel status={statusMapping[data.final_peritoneal_seeding_status]}>{statusMapping[data.final_peritoneal_seeding_status]}</StatusLabel> : 'N/A'}
            {data.final_peritoneal_seeding_status !== "P0" && data.peritoneal_seeding && 
              <span className="block pl-4 text-sm">{data.peritoneal_seeding}</span>
            }
          </p>
          <p><strong>Resectability:</strong> <StatusLabel status={metastasisStatus}>{metastasisStatus}</StatusLabel></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overall Resectability</CardTitle>
        </CardHeader>
        <CardContent>
          <p><StatusLabel status={overallResectability}>{overallResectability}</StatusLabel></p>
          {overallResectability !== "Resectable" && (
            <p className="pl-4 text-sm">
              Causes: {getResectabilityCauses().join(", ")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const PancreasCancerReportNavigator = ({ jsonData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % jsonData.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + jsonData.length) % jsonData.length);
  };

  // Check if the current data is empty or undefined
  const isCurrentDataValid = jsonData[currentIndex] && Object.keys(jsonData[currentIndex]).length > 0;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4 text-center">
        <span className="font-bold">Case {currentIndex + 1} of {jsonData.length}</span>
      </div>
      {isCurrentDataValid ? (
        <PancreasCancerReport data={jsonData[currentIndex]} />
      ) : (
        <div className="text-center py-4">No data available for this case.</div>
      )}
      <div className="flex justify-center space-x-4 mt-4">
        <button 
          onClick={handlePrevious} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={jsonData.length <= 1}
        >
          Previous
        </button>
        <button 
          onClick={handleNext} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={jsonData.length <= 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PancreasCancerReportNavigator;