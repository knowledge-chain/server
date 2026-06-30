import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

export const generateCertificatePdf = (
  studentName: string,
  courseName: string
) => {
  return new Promise<string>(
    (resolve, reject) => {
      const fileName = `certificate-${Date.now()}.pdf`;

      const filePath = path.join(
        process.cwd(),
        "uploads",
        fileName
      );

      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
      });

      const stream =
        fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Border
      doc
        .rect(20, 20, 800, 550)
        .lineWidth(4)
        .stroke();

      doc
        .fontSize(30)
        .text(
          "CERTIFICATE OF COMPLETION",
          0,
          80,
          {
            align: "center",
          }
        );

      doc.moveDown();

      doc
        .fontSize(20)
        .text(
          "This certifies that",
          {
            align: "center",
          }
        );

      doc.moveDown();

      doc
        .fontSize(35)
        .text(studentName, {
          align: "center",
        });

      doc.moveDown();

      doc
        .fontSize(20)
        .text(
          "has successfully completed",
          {
            align: "center",
          }
        );

      doc.moveDown();

      doc
        .fontSize(28)
        .text(courseName, {
          align: "center",
        });

      doc.moveDown(2);

      doc
        .fontSize(16)
        .text(
          `Issued: ${new Date().toDateString()}`,
          {
            align: "center",
          }
        );

      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });

      stream.on("error", reject);
    }
  );
};


export const uploadPdfToIPFS = async (filePath: string) => {
  const formData = new FormData();

  formData.append("file", fs.createReadStream(filePath));

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: process.env.PINATA_API_KEY!,
        pinata_secret_api_key: process.env.PINATA_API_SECRET!,
      },
    }
  );

  const cid = res.data.IpfsHash;

  return {
    cid,
    url: `https://gateway.pinata.cloud/ipfs/${cid}`,
  };
};


export const uploadMetadataToIPFS = async (metadata: any) => {
  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key: process.env.PINATA_API_KEY!,
          pinata_secret_api_key: process.env.PINATA_API_SECRET!,
        },
      }
    );

    const cid = res.data.IpfsHash;

    return {
      cid,
      url: `https://gateway.pinata.cloud/ipfs/${cid}`,
    };
  } catch (error: any) {
    console.error("Metadata upload failed:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
};