import { ethers } from "ethers";
import { nftTokenAbi } from "./nftToken.abi";
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);

const signer = new ethers.Wallet(
  process.env.ADMIN_WALLET_PRIVATEKEY!,
  provider
);

const contract = new ethers.Contract(
  process.env.NFT_TOKEN_CONTRACT_ADDRESS!,
  nftTokenAbi,
  signer
) as any;

const TIER = {
  TIER1: 1,
  TIER2: 2,
  TIER3: 3,
  TIER4: 4,
};

export const mint = async (walletAddress: string, img: string, tier: any) => {
    console.log("walletAddress", walletAddress)
  try {
    console.log("Start minting...");

    const tx = await contract.mintOption(walletAddress, tier, img);

    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();

    console.log("Transaction mined:", receipt);

    return {
      status: true,
      data: receipt,
    };
  } catch (error: any) {
    console.log("Mint error:", error);

    try {
      console.log(
        "Decoded error:",
        contract.interface.parseError(error.data)
      );
    } catch {}

    return {
      status: false,
      message: "Unable to perform mint transaction",
    };
  }
};


export const checkTierAccess = async (walletAddress: string, tier: any) => {
  try {
    const checkAccess = await contract.hasAccess(walletAddress, tier);

    return {
      status: true,
      checkAccess
    };
  } catch (error: any) {
    return {
      status: false,
      message: "Unable to Check Access",
    };
  }
};


export const tierPrice = async (tier: any) => {
  try {
    const price = await contract.tierPrices(tier);

    return {
      status: true,
      price
    };
      
  } catch (error: any) {
     return {
      status: false,
      message: "Unable to fetch price",
    };
  }
}

export const changeTierPrice = async (tier: any, amount: string) => {
  try {
      console.log(1)

      const tx = await contract.connect(signer).setTierPrice(tier, ethers.parseUnits(amount, 6));


      console.log(2)

      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log(3)
      console.log("Transaction mined:", receipt);
      console.log(4)

      return {
        status: true,
        data: receipt,
      };
      
  } catch (error: any) {
    console.log('error', error)

    return {
      status: false,
      message: "Unable to perform set Price blockchain transaction",
    };
  }
}