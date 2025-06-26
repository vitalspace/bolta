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

  async compileAndSendTxn(txn: Transaction) {
    try {
      const connectedAccount = this.getConnectedAccount();
      if (!connectedAccount) {
        throw new Error("No hay cuenta conectada");
      }

      console.log("Firmando transacción...");
      
      // Formato correcto para Pera Wallet
      const txnsToSign = [{
        txn: txn,
        signers: [connectedAccount],
      }];

      const signedTxns = await peraWallet.signTransaction(txnsToSign);
      const txId = txn.txID().toString();

      console.log("Enviando transacción firmada...");
      await algoclient.sendRawTransaction(signedTxns).do();
      
      console.log("Esperando confirmación...");
      await algosdk.waitForConfirmation(algoclient, txId, 3);

      const confirmedTxn = await algoclient.pendingTransactionInformation(txId).do();
      console.log("Transacción confirmada:", txId);
      
      return confirmedTxn;
    } catch (error) {
      console.error("Error al compilar y enviar transacción:", error);
      throw error;
    }
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

      console.log("Ejecutando método ABI:", methodName);

      // Limpiar el AtomicTransactionComposer
      this.atc = new algosdk.AtomicTransactionComposer();

      // Obtener el método del contrato
      const method = contract.getMethodByName(methodName);

      // Crear signer personalizado para ABI
      const signer = {
        addr: connectedAccount,
        signer: async (txnGroup: Transaction[], indexesToSign: number[]) => {
          const txnsToSign = txnGroup.map((txn, index) => ({
            txn,
            signers: indexesToSign.includes(index) ? [connectedAccount] : [],
          }));

          const signedTxns = await peraWallet.signTransaction(txnsToSign);
          return signedTxns;
        }
      };

      // Agregar la llamada al método ABI
      this.atc.addMethodCall({
        appID: appId,
        method: method,
        methodArgs: methodArgs,
        sender: connectedAccount,
        suggestedParams: params,
        signer: signer,
        ...extraTxnFields,
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

  async callPayment() {
    console.log("Llamando método payment() usando ABI...");
    return await this.executeABIMethod("payment");
  }

  async createNFT() {
    console.log("Creando NFT...");

    try {
      const connectedAccount = this.getConnectedAccount();

      if (!connectedAccount) {
        throw new Error("No hay cuenta conectada");
      }

      // Verificar el balance de la cuenta
      const accountInfo = await algoclient.accountInformation(connectedAccount).do();
      const balance = accountInfo.amount;
      console.log("Balance de la cuenta:", balance, "microAlgos");

      if (balance < 1000000) { // Menos de 1 ALGO
        console.error("Balance insuficiente. Se necesita al menos 1 ALGO para crear NFTs.");
        throw new Error("Balance insuficiente. Se necesita al menos 1 ALGO para crear NFTs.");
      }

      // Verificar si la cuenta ya hizo opt-in a la aplicación
      const hasOptedIn = accountInfo['apps-local-state']?.some((app: any) => app.id === appId);
      
      if (!hasOptedIn) {
        console.log("Realizando opt-in a la aplicación primero...");
        try {
          await this.optInApp(appId);
          console.log("Opt-in completado, esperando confirmación...");
          
          // Esperar un poco más para que la transacción se confirme
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (optInError) {
          console.error("Error en opt-in:", optInError);
          throw new Error("Error al hacer opt-in a la aplicación");
        }
      } else {
        console.log("La cuenta ya tiene opt-in a la aplicación");
      }

      // Intentar crear el NFT usando el método ABI
      console.log("Llamando método nonFungibleAssetCreateAndSend usando ABI...");
      const result = await this.executeABIMethod("nonFungibleAssetCreateAndSend");
      
      console.log("NFT creado exitosamente:", result);
      return result;

    } catch (error) {
      console.error("Error detallado al crear NFT:", error);
      throw error;
    }
  }

  async createNFTDirect() {
    const params = await algoclient.getTransactionParams().do();
    const connectedAccount = this.getConnectedAccount();

    if (!connectedAccount) {
      throw new Error("No hay cuenta conectada");
    }

    // Aumentar el fee significativamente para cubrir las transacciones internas
    params.fee = 10000; // 0.01 ALGO
    params.flatFee = true;

    console.log("Creando NFT con parámetros:", {
      fee: params.fee,
      flatFee: params.flatFee,
      sender: connectedAccount
    });

    const txn = algosdk.makeApplicationCallTxnFromObject({
      sender: connectedAccount,
      suggestedParams: params,
      appIndex: appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        new Uint8Array(Buffer.from("nonFungibleAssetCreateAndSend"))
      ],
    });

    const result = await this.compileAndSendTxn(txn);
    return result;
  }

  async optInApp(id: number) {
    console.log("Realizando opt-in a la app...");

    const params = await algoclient.getTransactionParams().do();
    const connectedAccount = this.getConnectedAccount();

    if (!connectedAccount) {
      throw new Error("No hay cuenta conectada");
    }

    // Usar fee estándar para opt-in
    params.fee = 1000;
    params.flatFee = true;

    const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
      sender: connectedAccount,
      suggestedParams: params,
      appIndex: appId,
    });

    const result = await this.compileAndSendTxn(optInTxn);
    console.log("Opt-in exitoso. TxID:", result.txn?.txn?.tx || "ID no disponible");
    return result;
  }
}

export const app = new App();