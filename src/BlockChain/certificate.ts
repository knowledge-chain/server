import { ethers } from "ethers";
import { certificateAbi } from "./certificate.abi";
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);

const signer = new ethers.Wallet(
  process.env.ADMIN_WALLET_PRIVATEKEY!,
  provider
);

const contract = new ethers.Contract(
  process.env.CERTIFICATE_CONTRACT_ADDRESS!,
  certificateAbi,
  signer
) as any;

export const completeLesson = async (walletAddress: string, course: string, lesson: string) => {
  try {
    const tx = await contract.completeLesson(walletAddress, course, lesson);

    const receipt = await tx.wait();

    return {
      status: true,
      hash: tx.hash,
      data: receipt,
    };
  } catch (error: any) {
    console.error("Error:", error);

    try {
      console.log(
        "Decoded error:",
        contract.interface.parseError(error.data)
      );
    } catch {}

    return {
      status: false,
      message: "Unable to perform complete lesson transaction",
    };
  }
};


export const mintCertificate = async (walletAddress: string, course: string, metadataUrl: string) => {
  try {
    const tx = await contract.mintCertificate(walletAddress, course, metadataUrl);

    const receipt = await tx.wait();

    let tokenId: string | null = null;

    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);

        if (
          parsed &&
          parsed.name === "CertificateMinted"
        ) {
          tokenId = parsed.args.tokenId.toString();
        }
      } catch {}
    }

    return {
      status: true,
      tokenId,
      hash: tx.hash,
      data: receipt,
    };
  } catch (error: any) {
    console.error("Mint error:", error);

    try {
      console.log(
        "Decoded error:",
        contract.interface.parseError(error.data)
      );
    } catch {}

    return {
      status: false,
      message: "Unable to perform mint certificate transaction",
    };
  }
};