import pdfMake from "pdfmake/build/pdfmake";
import { formatDate } from "./format";
import { TDocumentDefinitions, TFontDictionary } from "pdfmake/interfaces";
import { thSarabunFont } from "../../fonts/thSarabunFont";

// เพิ่ม type definitions
type PageOrientation = "portrait" | "landscape";
type Alignment = "left" | "center" | "right" | "justify";

interface ExportPDFOptions<T = Record<string, string | number>> {
  title: string;
  filename: string;
  headers: string[];
  data: T[];
  mapping: (item: T) => string[];
  columnWidths?: (string | number)[];
  styles?: {
    fontSize?: number;
    alignment?: Alignment;
  };
  pageOrientation?: PageOrientation;
}

// กำหนด virtual font storage และ fonts dictionary ก่อนใช้งาน
const vfs = {
  "THSarabunNew.ttf": thSarabunFont.normal,
  "THSarabunNew-Bold.ttf": thSarabunFont.bold,
  "THSarabunNew-Italic.ttf": thSarabunFont.italics,
  "THSarabunNew-BoldItalic.ttf": thSarabunFont.bolditalics,
};

const fonts: TFontDictionary = {
  THSarabunNew: {
    normal: "THSarabunNew.ttf",
    bold: "THSarabunNew-Bold.ttf",
    italics: "THSarabunNew-Italic.ttf",
    bolditalics: "THSarabunNew-BoldItalic.ttf",
  },
};

// กำหนดค่าให้กับ pdfMake
pdfMake.vfs = vfs;
pdfMake.fonts = fonts;

export const exportToPDF = <T>({
  title,
  filename,
  headers,
  data,
  mapping,
  columnWidths,
  styles,
  pageOrientation,
}: ExportPDFOptions<T>) => {
  const docDefinition: TDocumentDefinitions = {
    pageOrientation: pageOrientation || "portrait",
    content: [
      {
        text: title,
        fontSize: 16,
        margin: [0, 0, 0, 10],
        font: "THSarabunNew",
      },
      {
        text: `วันที่พิมพ์: ${formatDate(new Date().toISOString())}`,
        fontSize: 10,
        margin: [0, 0, 0, 10],
        font: "THSarabunNew",
      },
      {
        table: {
          headerRows: 1,
          widths: columnWidths || Array(headers.length).fill("*"),
          body: [headers, ...data.map(mapping)],
        },
        fontSize: styles?.fontSize || 14,
        alignment: styles?.alignment || "left",
      },
    ],
    defaultStyle: {
      font: "THSarabunNew",
    },
    styles: {
      tableHeader: {
        font: "THSarabunNew",
        bold: true,
        fontSize: 14,
      },
    },
  };

  pdfMake.createPdf(docDefinition).download(`${filename}.pdf`);
};
