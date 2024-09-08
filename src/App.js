import React, { useState, useCallback } from 'react';
import './index.css';  // Make sure this line is present
import Papa from 'papaparse';
import PancreasCancerReportNavigator from './PancreasCancerReport';

const App = () => {
  const [jsonData, setJsonData] = useState([]);

  const safeJSONParse = useCallback((str) => {
    if (!str || str === '') return null;
    try {
      const jsonString = str.replace(/'/g, '"').replace(/"([^"]*)":/g, (match, p1) => `"${p1.replace(/"/g, "'")}":`);
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", str);
      return null;
    }
  }, []);

  const strictClean = useCallback((data, template) => {
    if (typeof data !== 'object' || data === null) return template;

    const result = {};
    for (const key in template) {
      if (typeof template[key] === 'object' && template[key] !== null) {
        result[key] = strictClean(data[key], template[key]);
      } else {
        result[key] = data[key] !== undefined ? data[key] : template[key];
      }
    }
    return result;
  }, []);

  const ensureDataStructure = useCallback((data) => {
    const template = {
      model: '',
      arterial_variations: { status: '', ref: '' },
      artery: {
        celiac_axis: { status: '', ref: '' },
        common_hepatic_artery: { status: '', ref: '' },
        superior_mesenteric_artery: { status: '', ref: '' }
      },
      vein: {
        main_portal_vein: { status: '', ref: '' },
        superior_mesenteric_vein: { status: '', ref: '' }
      },
      inferior_vena_cava: { status: '', ref: '' },
      aorta: { status: '', ref: '' },
      regional_lymph_node: { status: '', ref: '' },
      distant_lymph_node: { status: '', ref: '' },
      tumor_morphology: '',
      tumor_size: '',
      adjacent_organ_invasion: '',
      tumor_location: '',
      bile_duct: { status: '', ref: '' },
      main_pancreatic_duct: { status: '', ref: '' },
      peritoneal_seeding: '',
      final_hematogenous_metastasis_status: '',
      hematogenous_metastasis: '',
      final_peritoneal_seeding_status: ''
    };

    return strictClean(data, template);
  }, [strictClean]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          processCSVData(result.data);
        },
        header: true,
        dynamicTyping: true,
      });
    }
  };

  const processCSVData = (csvData) => {
    const data = csvData
      .filter(row => Object.keys(row).length > 1 && row.model) // Filter out empty rows and ensure 'model' exists
      .map(row => {
        const processedRow = {
          model: row["model"] || '',
          arterial_variations: safeJSONParse(row["arterial_variations"]),
          artery: safeJSONParse(row["artery"]),
          inferior_vena_cava: safeJSONParse(row["inferior_vena_cava"]),
          aorta: safeJSONParse(row["aorta"]),
          branches_and_other: safeJSONParse(row["branches_and_other"]),
          vein: safeJSONParse(row["vein"]),
          regional_lymph_node: safeJSONParse(row["regional_lymph_node"]),
          distant_lymph_node: safeJSONParse(row["distant_lymph_node"]),
          tumor_morphology: row["tumor_morphology"] || '',
          tumor_size: row["tumor_size"] ? String(row["tumor_size"]) : '',
          adjacent_organ_invasion: row["adjacent_organ_invasion"] || '',
          tumor_location: row["tumor_location"] || '',
          bile_duct: safeJSONParse(row["bile_duct"]),
          main_pancreatic_duct: safeJSONParse(row["main_pancreatic_duct"]),
          peritoneal_seeding: row["peritoneal_seeding"] || '',
          final_hematogenous_metastasis_status: row["final_hematogenous_metastasis_status"] || '',
          hematogenous_metastasis: row["hematogenous_metastasis"] || '',
          final_peritoneal_seeding_status: row["final_peritoneal_seeding_status"] || '',
        };
        return ensureDataStructure(processedRow);
      });
    setJsonData(data);
  };

  return (
    <div className="App">
      <div className="p-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
      </div>
      {jsonData.length > 0 ? (
        <PancreasCancerReportNavigator jsonData={jsonData} />
      ) : (
        <p className="text-center py-4">Please upload a CSV file to view the report.</p>
      )}
    </div>
  );
};

export default App;