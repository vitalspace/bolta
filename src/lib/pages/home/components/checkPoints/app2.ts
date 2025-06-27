import algosdk, { Transaction } from "algosdk";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { PeraWalletConnect } from "@perawallet/connect";

const algoclient = AlgorandClient.testNet();

const peraWallet = new PeraWalletConnect({
  chainId: 416002, // ID de cadena de TestNet
});

const API_TESTNET = "https://testnet-api.algonode.cloud";

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
      console.log("No se encontró sesión activa:", error);
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
      console.error("Error al conectar la billetera:", error);
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
      console.error("Error al reconectar la billetera:", error);
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

  async getMyAssets() {
    const req = await fetch(
      `${API_TESTNET}/v2/accounts/${this.getConnectedAccount()}/assets`
    );
    const res = await req.json();
    console.log(res);
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

    const createtAsset = result.assetId;
    console.log(createtAsset);
  }

  async assetInfo(assetId: any) {
    const result = await algoclient.asset.getById(assetId);
    console.log(result, "account", this.getConnectedAccount()!);
  }
}

export const app = new App();