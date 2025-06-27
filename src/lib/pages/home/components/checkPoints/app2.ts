import algosdk, { Transaction } from "algosdk";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { PeraWalletConnect } from "@perawallet/connect";

const algoclient = AlgorandClient.testNet();

const peraWallet = new PeraWalletConnect({
  chainId: 416002, // TestNet chain ID
});

const API_TESTNET = "https://testnet-api.algonode.cloud";

export interface AccountInfo {
  address: string;
  balance: number;
  assets: any[];
  totalAssets: number;
}

class App {
  constructor() {}
  
  getConnectedAccount(): string | null {
    try {
      const savedAccount = localStorage.getItem("peraWallet.account");
      if (savedAccount) return savedAccount;
      const accounts = peraWallet.connector?.accounts;
      if (accounts && accounts.length > 0) return accounts[0];
      return null;
    } catch (error) {
      console.log("No active session found:", error);
      return null;
    }
  }

  async connectWallet(): Promise<string[]> {
    try {
      await peraWallet.reconnectSession();
      if (peraWallet.connector?.accounts.length) {
        return peraWallet.connector.accounts;
      }
      const accounts = await peraWallet.connect();
      localStorage.setItem("peraWallet.account", accounts[0]);
      return accounts;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }

  async reconnectWallet(): Promise<string | null> {
    try {
      const savedAccount = localStorage.getItem("peraWallet.account");
      if (!savedAccount) return null;
      await peraWallet.reconnectSession();
      const accounts = peraWallet.connector?.accounts;
      if (accounts && accounts.includes(savedAccount)) {
        return savedAccount;
      } else {
        localStorage.removeItem("peraWallet.account");
        return null;
      }
    } catch (error) {
      localStorage.removeItem("peraWallet.account");
      console.error("Error reconnecting wallet:", error);
      return null;
    }
  }

  disconnectWallet(): void {
    peraWallet.disconnect();
    localStorage.removeItem("peraWallet.account");
  }

  async signTransaction(
    txnGroup: Transaction[],
    indexesToSign: number[]
  ): Promise<Uint8Array[]> {
    const sender = this.getConnectedAccount()!;

    const signerTxns = txnGroup.map((txn, i) => ({
      txn,
      signers: indexesToSign.includes(i) ? [sender] : [],
    }));

    const signedBlobs = await peraWallet.signTransaction([signerTxns], sender);

    return signedBlobs;
  }

  async getAccountInfo(): Promise<AccountInfo | null> {
    const account = this.getConnectedAccount();
    if (!account) return null;

    try {
      // Get account information from the main account endpoint
      const accountInfoReq = await fetch(`${API_TESTNET}/v2/accounts/${account}`);
      const accountData = await accountInfoReq.json();

      console.log("Full account data:", accountData);

      // Extract assets from the account data
      // The assets are in the 'assets' field, not 'asset-holdings'
      const assets = accountData.assets || [];
      
      return {
        address: account,
        balance: accountData.amount / 1000000, // Convert microAlgos to Algos
        assets: assets,
        totalAssets: assets.length
      };
    } catch (error) {
      console.error("Error getting account info:", error);
      return null;
    }
  }

  async getMyAssets() {
    const account = this.getConnectedAccount();
    if (!account) return null;

    try {
      // Use the main account endpoint which includes assets
      const req = await fetch(`${API_TESTNET}/v2/accounts/${account}`);
      const res = await req.json();
      console.log("Complete account response:", res);
      
      // Return the assets from the account data
      return {
        assets: res.assets || [],
        assetHoldings: res['asset-holdings'] || []
      };
    } catch (error) {
      console.error("Error getting assets:", error);
      return null;
    }
  }

  async mint() {
    const result = await algoclient.send.assetCreate({
      sender: this.getConnectedAccount()!,
      total: 1n,
      decimals: 0,
      assetName: "Bolta test 2",
      unitName: "BOLTATS",
      url: "https://bolta.world/2",
      signer: this.signTransaction.bind(this),
    });

    const createdAsset = result.assetId;
    console.log("Created asset ID:", createdAsset);
    return createdAsset;
  }

  async assetInfo(assetId: any) {
    const result = await algoclient.asset.getById(assetId);
    console.log("Asset info:", result, "account:", this.getConnectedAccount()!);
    return result;
  }
}

export const app = new App();