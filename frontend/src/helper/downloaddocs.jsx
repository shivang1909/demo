import JSZip from "jszip";
import { saveAs } from "file-saver";


// Function to download all documents as zip
export const handleDownloadDocuments = async (docs,id,name) => {
  if ( docs.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder("Documents");

  for (const doc of docs) {
    if (doc.path && doc.verified) {
      try {
        const response = await fetch(`/${doc.path.replace(/\\/g, '/')}`);
         const extension = doc.path.split('.').pop();
        const blob = await response.blob();
        folder.file(doc.name + '.'+extension , blob);
      } catch (err) {
        console.error("Error downloading document:", doc.name, err);
      }
    }
  }

  const clientId = id?.slice(-4) || "0000";
  const fileName = `${name}_${clientId}.zip`;

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, fileName);
  });
};
