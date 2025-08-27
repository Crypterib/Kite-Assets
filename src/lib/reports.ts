
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Asset } from "./types";
import { format } from "date-fns";

const generatePdf = (title: string, assets: Asset[], columns: { header: string, dataKey: string }[], filename: string, orgName: string) => {
    const doc = new jsPDF();
    
    const tableData = assets.map(asset => {
        return columns.map(col => {
            const data = asset[col.dataKey as keyof Asset];
            if (col.dataKey === 'purchaseDate' && data instanceof Date) {
                return format(data, 'yyyy-MM-dd');
            }
             if (col.dataKey === 'status' && typeof data === 'string') {
                return data.replace(/([A-Z])/g, ' $1').trim();
            }
            return data;
        });
    });

    autoTable(doc, {
        head: [columns.map(c => c.header)],
        body: tableData,
        didDrawPage: (data) => {
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text(title, data.settings.margin.left, 22);

            doc.setFontSize(12);
            doc.text(orgName, data.settings.margin.left, 28);

            const pageCount = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = data.settings.margin;
            doc.setFontSize(8);

            doc.text(
                `Powered by Kite Assets`,
                margin.left,
                pageHeight - 9,
            );

            doc.text(
                `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
                pageCount / 2,
                pageHeight - 9,
                { align: "center" }
            );

            doc.text(
                `Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
                pageCount - margin.right,
                pageHeight - 9,
                { align: "right" }
            );
        },
        startY: 35,
    });

    doc.save(`${filename}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

const allAssetColumns = [
    { header: 'Asset Tag', dataKey: 'assetTag' },
    { header: 'Name', dataKey: 'name' },
    { header: 'Category', dataKey: 'categoryName' },
    { header: 'Location', dataKey: 'locationName' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Purchase Date', dataKey: 'purchaseDate' },
    { header: 'Value', dataKey: 'value' },
];


export const generateFullInventoryReport = (assets: Asset[], orgName: string) => {
    generatePdf("Full Inventory Report", assets, allAssetColumns, "full_inventory_report", orgName);
};

export const generateMaintenanceReport = (assets: Asset[], orgName: string) => {
    const maintenanceAssets = assets.filter(asset => asset.status === 'UnderMaintenance');
    generatePdf("Maintenance Report", maintenanceAssets, allAssetColumns, "maintenance_report", orgName);
};

export const generateRetiredAssetsReport = (assets: Asset[], orgName: string) => {
    const retiredAssets = assets.filter(asset => asset.status === 'Retired');
    generatePdf("Retired Assets Report", retiredAssets, allAssetColumns, "retired_assets_report", orgName);
};
