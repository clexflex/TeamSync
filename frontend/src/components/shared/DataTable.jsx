//  # Reusable table component
import React from "react";
import DataTable from "react-data-table-component";

const CustomDataTable = ({ columns, data, title, pagination = true, highlightOnHover = true }) => {
  const customStyles = {
    rows: {
      style: {
        minHeight: "48px",
      },
    },
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        backgroundColor: "#f1f5f9",
        color: "#334155",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        color: "#334155",
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <DataTable
        columns={columns}
        data={data}
        customStyles={customStyles}
        pagination={pagination}
        highlightOnHover={highlightOnHover}
      />
    </div>
  );
};

export default CustomDataTable;
