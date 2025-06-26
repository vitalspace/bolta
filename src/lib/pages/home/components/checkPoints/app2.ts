import algosdk, { Transaction } from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
// Asumiendo que arc32.json contiene el ABI correcto para TaskManager
import arc32 from "./contracts/nftalbi.json";

const algoclient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  443
);

const peraWallet = new PeraWalletConnect({
  chainId: 416002, // ID de cadena de TestNet
});

const appId = 741611642;
const contract = new algosdk.ABIContract(arc32.contract);

class App {
  atc: algosdk.AtomicTransactionComposer;
  constructor() {
    this.atc = new algosdk.AtomicTransactionComposer();
  }

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

  // Crear un signer personalizado para Pera Wallet
  makePeraWalletSigner() {
    return {
      signTxn: async (txn: Transaction): Promise<Uint8Array> => {
        const txnToSign = {
          txn: txn,
          signers: [],
        };

        try {
          const signedTxn = await peraWallet.signTransaction([txnToSign]);
          return signedTxn[0];
        } catch (error) {
          console.error("Error al firmar con Pera Wallet:", error);
          throw error;
        }
      },
    };
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

  async executeABIMethod(
    methodName: string,
    methodArgs = [],
    extraTxnFields = {}
  ) {
    try {
      const params = await algoclient.getTransactionParams().do();
      const connectedAccount = this.getConnectedAccount();

      if (!connectedAccount) {
        throw new Error("No hay cuenta conectada");
      }

      // Limpiar el AtomicTransactionComposer
      this.atc = new algosdk.AtomicTransactionComposer();

      // Obtener el método del contrato
      const method = contract.getMethodByName(methodName);

      // Agregar la llamada al método ABI
      this.atc.addMethodCall({
        appID: appId,
        method: method,
        methodArgs: methodArgs,
        sender: connectedAccount,
        suggestedParams: params,
        signer: this.signTransaction.bind(this),
        ...extraTxnFields, // Para agregar accounts, foreignAssets, etc.
      });

      // Ejecutar las transacciones
      const result = await this.atc.execute(algoclient, 3);

      console.log(`Método ${methodName} ejecutado exitosamente`);
      console.log("Transaction ID:", result.txIDs[0]);

      // Extraer el valor de retorno si existe
      if (result.methodResults && result.methodResults.length > 0) {
        const returnValue = result.methodResults[0].returnValue;
        console.log("Valor de retorno:", returnValue);
        return returnValue;
      }

      return result;
    } catch (error) {
      console.error(`Error ejecutando método ${methodName}:`, error);
      throw error;
    }
  }

  async compileAndSendTxn(txn: Transaction) {
    try {
      const txnToSign = {
        txn: txn,
        signers: [],
      };

      const signedTxn = await peraWallet.signTransaction([txnToSign]);
      const txId = txn.txID().toString();

      await algoclient.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(algoclient, txId, 3);

      return await algoclient.pendingTransactionInformation(txId).do();
    } catch (error) {
      console.error("Error al compilar y enviar transacción:", error);
      throw error;
    }
  }

  async callPayment() {
    console.log("Llamando método payment() usando ABI...");
    return await this.executeABIMethod("payment");
  }

  async createFungibleAsset() {
    console.log("Creando asset fungible...");

    const params = await algoclient.getTransactionParams().do();
    const connectedAccount = this.getConnectedAccount();

    if (!connectedAccount) {
      throw new Error("No hay cuenta conectada");
    }

    const txn = algosdk.makeApplicationCallTxnFromObject({
      sender: connectedAccount,
      suggestedParams: params,
      appIndex: appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      //@ts-ignore
      appArgs: [new Uint8Array(Buffer.from("fungibleAssetCreate"))],
    });

    const result = await this.compileAndSendTxn(txn);
    console.log("Asset fungible creado:", result);
    return result;
  }

  async createNFT() {
    console.log("Creando NFT...");

    try {
      const params = await algoclient.getTransactionParams().do();
      const connectedAccount = this.getConnectedAccount();

      if (!connectedAccount) {
        throw new Error("No hay cuenta conectada");
      }

      // Verificar si la cuenta ya hizo opt-in a la aplicación
      try {
        const accountInfo = await algoclient.accountInformation(connectedAccount).do();
        const hasOptedIn = accountInfo['apps-local-state']?.some((app: any) => app.id === appId);
        
        if (!hasOptedIn) {
          console.log("Realizando opt-in a la aplicación primero...");
          await this.optInApp(appId);
          console.log("Opt-in completado, procediendo con la creación del NFT...");
        }
      } catch (optInError) {
        console.log("Error verificando opt-in, intentando opt-in:", optInError);
        try {
          await this.optInApp(appId);
        } catch (optInRetryError) {
          console.log("Opt-in falló, continuando con la creación del NFT...");
        }
      }

      // Usar el método ABI en lugar de llamada directa
      console.log("Llamando método nonFungibleAssetCreateAndSend usando ABI...");
      const result = await this.executeABIMethod("nonFungibleAssetCreateAndSend");
      
      console.log("NFT creado exitosamente:", result);
      return result;

    } catch (error) {
      console.error("Error detallado al crear NFT:", error);
      
      // Si el error es de ApprovalProgram, intentar con opt-in primero
      if (error.message && error.message.includes("ApprovalProgram")) {
        console.log("Error de ApprovalProgram detectado, intentando opt-in...");
        try {
          await this.optInApp(appId);
          console.log("Opt-in exitoso, reintentando creación de NFT...");
          const retryResult = await this.executeABIMethod("nonFungibleAssetCreateAndSend");
          console.log("NFT creado exitosamente en segundo intento:", retryResult);
          return retryResult;
        } catch (retryError) {
          console.error("Error en segundo intento:", retryError);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  async optInApp(id: number) {
    console.log("Realizando opt-in a la app...");

    const params = await algoclient.getTransactionParams().do();
    const connectedAccount = this.getConnectedAccount();

    if (!connectedAccount) {
      throw new Error("No hay cuenta conectada");
    }

    const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
      sender: connectedAccount,
      suggestedParams: params,
      appIndex: appId,
    });

    // Enviar la transacción firmada con Pera Wallet
    const signedTxn = await this.signTransaction.bind(this)([optInTxn], [0]);

    const txId = optInTxn.txID().toString();

    await algoclient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(algoclient, txId, 3);

    console.log("Opt-in exitoso. TxID:", txId);
    return txId;
  }
}

export const app = new App();