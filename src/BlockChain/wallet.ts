import { Wallet } from 'ethers';
import jwt from "jsonwebtoken";

export const createWallet = () => {
  const wallet = Wallet.createRandom();

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};


export  const verifyPrivateKey = (token: any)  => {
  let secret = process.env.PRIVATE_KEY_SECRET!;
  return jwt.verify(token, secret )
}