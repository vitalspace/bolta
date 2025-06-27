<script lang="ts">
  import { app, type AccountInfo } from "./app2";
  import { Wallet, X, Zap, Coins, Image, RefreshCw, User, DollarSign } from "@lucide/svelte";

  let { 
    isOpen = $bindable(false),
    onClose = () => {}
  } = $props();

  let isConnected = $state(false);
  let account = $state("");
  let isConnecting = $state(false);
  let isMinting = $state(false);
  let isLoadingInfo = $state(false);
  let accountInfo = $state<AccountInfo | null>(null);

  const init = async () => {
    try {
      const reconnectedAccount = await app.reconnectWallet();

      if (reconnectedAccount) {
        account = reconnectedAccount;
        isConnected = true;
        await loadAccountInfo();
      } else {
        const savedAccount = app.getConnectedAccount();
        if (savedAccount) {
          account = savedAccount;
          isConnected = true;
          await loadAccountInfo();
        }
      }
    } catch (error) {
      console.log("No existing session to reconnect");
      isConnected = false;
      account = "";
      accountInfo = null;
    }
  };

  const loadAccountInfo = async () => {
    if (!isConnected) return;
    
    try {
      isLoadingInfo = true;
      accountInfo = await app.getAccountInfo();
      console.log("Loaded account info:", accountInfo);
    } catch (error) {
      console.error("Error loading account info:", error);
    } finally {
      isLoadingInfo = false;
    }
  };

  async function handleConnect() {
    if (isConnected) {
      app.disconnectWallet();
      isConnected = false;
      account = "";
      accountInfo = null;
    } else {
      try {
        isConnecting = true;
        const accounts = await app.connectWallet();
        if (accounts.length > 0) {
          account = accounts[0];
          isConnected = true;
          await loadAccountInfo();
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      } finally {
        isConnecting = false;
      }
    }
  }

  function formatAccount(acc: string): string {
    if (!acc) return "";
    return `${acc.slice(0, 6)}...${acc.slice(-4)}`;
  }

  const mintNFT = async () => {
    if (!isConnected) {
      console.error("You must connect your wallet first");
      return;
    }

    try {
      isMinting = true;
      const assetId = await app.mint();
      console.log("NFT created successfully! Asset ID:", assetId);
      // Refresh account info after minting
      await loadAccountInfo();
    } catch (error) {
      console.error("Error creating NFT:", error);
    } finally {
      isMinting = false;
    }
  };

  const getAssets = async () => {
    if (!isConnected) {
      console.error("You must connect your wallet first");
      return;
    }

    try {
      const assets = await app.getMyAssets();
      console.log("Assets:", assets);
    } catch (error) {
      console.error("Error getting assets:", error);
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
  <!-- Modal Backdrop with higher z-index -->
  <div 
    class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    style="z-index: 9999;"
    onclick={handleBackdropClick}
  >
    <!-- Modal Content -->
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Wallet class="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">Algorand Blockchain</h2>
            <p class="text-sm text-gray-400">Connect your wallet and create NFTs</p>
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
              {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
            </span>
          </div>
          
          {#if isConnected}
            <div class="text-xs text-gray-400 mb-3">
              Account: <span class="text-blue-400 font-mono">{formatAccount(account)}</span>
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
                Connecting...
              </div>
            {:else if isConnected}
              <div class="flex items-center justify-center gap-2">
                <Wallet class="w-4 h-4" />
                Disconnect Wallet
              </div>
            {:else}
              <div class="flex items-center justify-center gap-2">
                <Wallet class="w-4 h-4" />
                Connect Pera Wallet
              </div>
            {/if}
          </button>
        </div>

        <!-- Account Information -->
        {#if isConnected}
          <div class="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-700/50">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <User class="w-5 h-5 text-green-400" />
                <h3 class="font-semibold text-white">Account Information</h3>
              </div>
              <button
                onclick={loadAccountInfo}
                disabled={isLoadingInfo}
                class="p-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw class="w-4 h-4 text-green-400 {isLoadingInfo ? 'animate-spin' : ''}" />
              </button>
            </div>

            {#if isLoadingInfo}
              <div class="flex items-center justify-center py-4">
                <div class="w-6 h-6 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
              </div>
            {:else if accountInfo}
              <div class="space-y-3">
                <!-- Balance -->
                <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div class="flex items-center gap-2">
                    <DollarSign class="w-4 h-4 text-green-400" />
                    <span class="text-sm text-gray-300">ALGO Balance</span>
                  </div>
                  <span class="text-sm font-semibold text-white">{accountInfo.balance.toFixed(6)} ALGO</span>
                </div>

                <!-- Assets Count -->
                <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div class="flex items-center gap-2">
                    <Coins class="w-4 h-4 text-blue-400" />
                    <span class="text-sm text-gray-300">Total Assets</span>
                  </div>
                  <span class="text-sm font-semibold text-white">{accountInfo.totalAssets}</span>
                </div>

                <!-- Address -->
                <div class="p-3 bg-gray-800/50 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <Wallet class="w-4 h-4 text-purple-400" />
                    <span class="text-sm text-gray-300">Address</span>
                  </div>
                  <div class="text-xs font-mono text-purple-400 break-all">{accountInfo.address}</div>
                </div>

                <!-- Assets List (if any) -->
                {#if accountInfo.assets.length > 0}
                  <div class="p-3 bg-gray-800/50 rounded-lg">
                    <div class="flex items-center gap-2 mb-2">
                      <Image class="w-4 h-4 text-yellow-400" />
                      <span class="text-sm text-gray-300">Recent Assets</span>
                    </div>
                    <div class="space-y-2 max-h-32 overflow-y-auto">
                      {#each accountInfo.assets.slice(0, 3) as asset}
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-gray-400">ID: {asset['asset-id']}</span>
                          <span class="text-white">{asset.amount}</span>
                        </div>
                      {/each}
                      {#if accountInfo.assets.length > 3}
                        <div class="text-xs text-gray-500 text-center">
                          +{accountInfo.assets.length - 3} more...
                        </div>
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="text-center py-4">
                <p class="text-sm text-gray-400">Error loading account information</p>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Actions -->
        {#if isConnected}
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white flex items-center gap-2">
              <Zap class="w-5 h-5 text-yellow-400" />
              Available Actions
            </h3>

            <!-- Mint NFT -->
            <div class="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-700/50">
              <div class="flex items-center gap-3 mb-3">
                <Image class="w-5 h-5 text-purple-400" />
                <div>
                  <h4 class="font-semibold text-white">Create NFT</h4>
                  <p class="text-xs text-gray-400">Create a unique non-fungible token</p>
                </div>
              </div>
              
              <button
                onclick={mintNFT}
                disabled={isMinting}
                class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {#if isMinting}
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating NFT...
                  </div>
                {:else}
                  <div class="flex items-center justify-center gap-2">
                    <Image class="w-4 h-4" />
                    Create NFT
                  </div>
                {/if}
              </button>
            </div>

            <!-- Get Assets -->
            <div class="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-4 border border-blue-700/50">
              <div class="flex items-center gap-3 mb-3">
                <Coins class="w-5 h-5 text-blue-400" />
                <div>
                  <h4 class="font-semibold text-white">View My Assets</h4>
                  <p class="text-xs text-gray-400">Check your tokens and NFTs in console</p>
                </div>
              </div>
              
              <button
                onclick={getAssets}
                class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <div class="flex items-center justify-center gap-2">
                  <Coins class="w-4 h-4" />
                  View Assets
                </div>
              </button>
            </div>
          </div>
        {:else}
          <!-- Not Connected State -->
          <div class="text-center py-8">
            <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet class="w-8 h-8 text-gray-500" />
            </div>
            <h3 class="text-lg font-semibold text-gray-300 mb-2">Connect Your Wallet</h3>
            <p class="text-sm text-gray-500">
              Connect your Pera Wallet to access Algorand blockchain features
            </p>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-700 bg-gray-800/50">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>Algorand TestNet</span>
          <span>AlgoKit Utils</span>
        </div>
      </div>
    </div>
  </div>
{/if}