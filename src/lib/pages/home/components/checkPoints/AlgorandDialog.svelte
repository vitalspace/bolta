<script lang="ts">
  import { app } from "./app2";
  import { Wallet, X, Zap, Coins, Image } from "@lucide/svelte";

  let { 
    isOpen = $bindable(false),
    onClose = () => {}
  } = $props();

  let isConnected = $state(false);
  let account = $state("");
  let isConnecting = $state(false);
  let isCreatingNFT = $state(false);

  const init = async () => {
    try {
      const reconnectedAccount = await app.reconnectWallet();

      if (reconnectedAccount) {
        account = reconnectedAccount;
        isConnected = true;
      } else {
        const savedAccount = app.getConnectedAccount();
        if (savedAccount) {
          account = savedAccount;
          isConnected = true;
        }
      }
    } catch (error) {
      console.log("No existing session to reconnect");
      isConnected = false;
      account = "";
    }
  };

  async function handleConnect() {
    if (isConnected) {
      app.disconnectWallet();
      isConnected = false;
      account = "";
    } else {
      try {
        isConnecting = true;
        const accounts = await app.connectWallet();
        if (accounts.length > 0) {
          account = accounts[0];
          isConnected = true;
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert(
          "Error al conectar la wallet. Asegúrate de tener Pera Wallet instalada."
        );
      } finally {
        isConnecting = false;
      }
    }
  }

  function formatAccount(acc: string): string {
    if (!acc) return "";
    return `${acc.slice(0, 6)}...${acc.slice(-4)}`;
  }

  const createNFT = async () => {
    if (!isConnected) {
      alert("Primero debes conectar tu wallet");
      return;
    }

    try {
      isCreatingNFT = true;
      await app.createNFT();
      alert("¡NFT creado exitosamente!");
    } catch (error) {
      console.error("Error creating NFT:", error);
      alert("Error al crear el NFT. Revisa la consola para más detalles.");
    } finally {
      isCreatingNFT = false;
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  $effect(() => {
    if (isOpen) {
      init();
    }
  });
</script>

{#if isOpen}
  <!-- Modal Backdrop -->
  <div 
    class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
  >
    <!-- Modal Content -->
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Wallet class="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">Algorand Blockchain</h2>
            <p class="text-sm text-gray-400">Conecta tu wallet y crea NFTs</p>
          </div>
        </div>
        <button 
          onclick={onClose}
          class="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
        >
          <X class="w-4 h-4 text-gray-300" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Connection Status -->
        <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-2 h-2 rounded-full {isConnected ? 'bg-green-400' : 'bg-red-400'}"></div>
            <span class="text-sm font-medium text-gray-300">
              {isConnected ? 'Wallet Conectada' : 'Wallet Desconectada'}
            </span>
          </div>
          
          {#if isConnected}
            <div class="text-xs text-gray-400 mb-3">
              Cuenta: <span class="text-blue-400 font-mono">{formatAccount(account)}</span>
            </div>
          {/if}

          <!-- Connect/Disconnect Button -->
          <button
            class="w-full {isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onclick={handleConnect}
            disabled={isConnecting}
          >
            {#if isConnecting}
              <div class="flex items-center justify-center gap-2">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Conectando...
              </div>
            {:else if isConnected}
              <div class="flex items-center justify-center gap-2">
                <Wallet class="w-4 h-4" />
                Desconectar Wallet
              </div>
            {:else}
              <div class="flex items-center justify-center gap-2">
                <Wallet class="w-4 h-4" />
                Conectar Pera Wallet
              </div>
            {/if}
          </button>
        </div>

        <!-- Actions -->
        {#if isConnected}
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white flex items-center gap-2">
              <Zap class="w-5 h-5 text-yellow-400" />
              Acciones Disponibles
            </h3>

            <!-- Create NFT -->
            <div class="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-700/50">
              <div class="flex items-center gap-3 mb-3">
                <Image class="w-5 h-5 text-purple-400" />
                <div>
                  <h4 class="font-semibold text-white">Crear NFT</h4>
                  <p class="text-xs text-gray-400">Crea un token no fungible único</p>
                </div>
              </div>
              
              <button
                onclick={createNFT}
                disabled={isCreatingNFT}
                class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {#if isCreatingNFT}
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creando NFT...
                  </div>
                {:else}
                  <div class="flex items-center justify-center gap-2">
                    <Image class="w-4 h-4" />
                    Crear NFT
                  </div>
                {/if}
              </button>
            </div>

            <!-- Future Actions Placeholder -->
            <div class="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 opacity-50">
              <div class="flex items-center gap-3 mb-3">
                <Coins class="w-5 h-5 text-gray-500" />
                <div>
                  <h4 class="font-semibold text-gray-400">Más Funciones</h4>
                  <p class="text-xs text-gray-500">Próximamente disponibles</p>
                </div>
              </div>
              
              <button
                disabled
                class="w-full bg-gray-700 text-gray-400 font-semibold py-2.5 px-4 rounded-lg cursor-not-allowed"
              >
                Próximamente
              </button>
            </div>
          </div>
        {:else}
          <!-- Not Connected State -->
          <div class="text-center py-8">
            <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet class="w-8 h-8 text-gray-500" />
            </div>
            <h3 class="text-lg font-semibold text-gray-300 mb-2">Conecta tu Wallet</h3>
            <p class="text-sm text-gray-500">
              Conecta tu Pera Wallet para acceder a las funciones de Algorand blockchain
            </p>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-700 bg-gray-800/50">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>Algorand TestNet</span>
          <span>App ID: 741611642</span>
        </div>
      </div>
    </div>
  </div>
{/if}