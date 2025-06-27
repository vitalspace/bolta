<script lang="ts">
  import { isInVehicle, vehicleData, keys } from "../../stores/stores";
  import { Gauge, Zap, LogOut, AlertTriangle } from "@lucide/svelte";

  // Get vehicle data from store with proper reactivity
  $: currentSpeed = $vehicleData.currentSpeed || 0;
  $: nitroLevel = $vehicleData.nitroLevel || 0;
  $: isNitroActive = $vehicleData.isNitroActive || false;
  $: nitroBlocked = $vehicleData.nitroBlocked || false;
  
  let maxSpeed = 120; // Maximum speed for percentage calculation

  // Calculate speedometer percentage - ensure it's properly clamped and always has a value
  $: speedPercentage = Math.max(0, Math.min((currentSpeed / maxSpeed) * 100, 100));
  $: nitroPercentage = Math.max(0, Math.min(nitroLevel, 100));

  // Determine speedometer color based on speed
  $: speedColor = speedPercentage < 30 
    ? 'text-green-400' 
    : speedPercentage < 70 
    ? 'text-yellow-400' 
    : 'text-red-400';

  // Calculate stroke dash offset for circular progress
  let circleCircumference = 283; // 2 * π * 45 (radius)
  $: strokeDashOffset = circleCircumference - (circleCircumference * speedPercentage) / 100;

  // Function to exit vehicle
  const exitVehicle = () => {
    // Simulate pressing E to exit
    const event = new KeyboardEvent('keydown', { keyCode: 69 });
    document.dispatchEvent(event);
  };

  // Debug logging to track data changes
  $: {
    console.log('VehicleUI Data Update:', {
      currentSpeed,
      speedPercentage,
      nitroLevel,
      isNitroActive,
      nitroBlocked
    });
  }
</script>

{#if $isInVehicle}
  <div class="fixed inset-0 pointer-events-none z-50">
    <!-- Speedometer - Bottom left corner -->
    <div class="absolute bottom-8 left-8 pointer-events-auto">
      <div class="bg-black/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <!-- Circular speedometer -->
        <div class="relative w-32 h-32 mb-4">
          <!-- Background circle -->
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <!-- Circle background -->
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgb(55, 65, 81)"
              stroke-width="8"
            />
            <!-- Speedometer progress -->
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              stroke-width="8"
              stroke-linecap="round"
              stroke-dasharray={circleCircumference}
              stroke-dashoffset={strokeDashOffset}
              class="transition-all duration-200 {speedColor}"
              style="transition-property: stroke-dashoffset, color;"
            />
          </svg>
          
          <!-- Speed in the center -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-2xl font-bold text-white">{Math.round(currentSpeed)}</span>
            <span class="text-xs text-gray-400">KM/H</span>
          </div>
        </div>

        <!-- Speed indicator bar - ALWAYS VISIBLE with minimum width -->
        <div class="text-center">
          <div class="flex items-center justify-center gap-2 mb-2">
            <Gauge class="w-4 h-4 text-gray-400" />
            <span class="text-sm text-gray-300">Speed</span>
          </div>
          <!-- Progress bar container - always visible -->
          <div class="w-full bg-gray-700 rounded-full h-2 mb-2 relative overflow-hidden">
            <!-- Progress bar fill - with minimum width and proper calculation -->
            <div 
              class="h-full rounded-full transition-all duration-200 absolute top-0 left-0"
              style="
                width: {Math.max(speedPercentage, 0)}%; 
                min-width: {speedPercentage > 0 ? '4px' : '0px'};
                background-color: {speedPercentage < 30 ? '#4ade80' : speedPercentage < 70 ? '#facc15' : '#f87171'};
                transition-property: width, background-color;
              "
            ></div>
          </div>
          <!-- Debug info - shows actual values -->
          <div class="text-xs text-gray-500">
            Speed: {speedPercentage.toFixed(1)}% ({currentSpeed.toFixed(1)} km/h)
          </div>
        </div>
      </div>
    </div>

    <!-- Nitro Panel - Bottom right corner -->
    <div class="absolute bottom-8 right-8 pointer-events-auto">
      <div class="bg-black/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <!-- Nitro Indicator -->
        <div class="flex items-center gap-3 mb-4">
          <div class="relative">
            {#if nitroBlocked}
              <AlertTriangle class="w-8 h-8 text-red-400 animate-pulse" />
            {:else}
              <Zap class="w-8 h-8 {isNitroActive ? 'text-blue-400 animate-pulse' : 'text-gray-400'}" />
              {#if isNitroActive}
                <div class="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
              {/if}
            {/if}
          </div>
          <div>
            <div class="text-white font-semibold">
              {nitroBlocked ? 'BLOCKED' : 'NITRO'}
            </div>
            <div class="text-sm {nitroBlocked ? 'text-red-400' : 'text-gray-400'}">
              {Math.round(nitroPercentage)}%
            </div>
          </div>
        </div>

        <!-- Nitro Bar - also with minimum width -->
        <div class="w-32 bg-gray-700 rounded-full h-3 mb-4 relative overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-300 absolute top-0 left-0"
            style="
              width: {Math.max(nitroPercentage, 0)}%; 
              min-width: {nitroPercentage > 0 ? '4px' : '0px'};
              background-color: {nitroBlocked ? '#f87171' : nitroPercentage > 20 ? '#60a5fa' : '#f87171'};
            "
          ></div>
        </div>

        <!-- Nitro Controls -->
        <div class="text-center">
          <div class="text-xs text-gray-400 mb-2">
            {#if nitroBlocked}
              <span class="text-red-400 font-semibold">NITRO DEPLETED</span>
              <br>
              <span class="text-xs">Wait for regeneration</span>
            {:else if $keys.shift.isPressed && isNitroActive}
              <span class="text-blue-400 font-semibold">NITRO ACTIVE</span>
            {:else if $keys.shift.isPressed && !isNitroActive}
              <span class="text-yellow-400 font-semibold">NO NITRO</span>
            {:else}
              <span>Hold SHIFT for nitro</span>
            {/if}
          </div>
          <!-- Debug info for nitro -->
          <div class="text-xs text-gray-600">
            Nitro: {nitroPercentage.toFixed(1)}% | Active: {isNitroActive ? 'Yes' : 'No'}
          </div>
        </div>
      </div>
    </div>

    <!-- Exit Button - Top right corner -->
    <div class="absolute top-8 right-8 pointer-events-auto">
      <button
        onclick={exitVehicle}
        class="bg-red-600/80 hover:bg-red-600 backdrop-blur-sm rounded-xl p-4 border border-red-400/30 transition-all duration-200 hover:scale-105 group"
      >
        <div class="flex items-center gap-3">
          <LogOut class="w-5 h-5 text-white group-hover:animate-pulse" />
          <div class="text-white">
            <div class="font-semibold">Exit</div>
            <div class="text-xs opacity-75">Press E</div>
          </div>
        </div>
      </button>
    </div>

    <!-- On-screen Controls - Bottom center -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
      <div class="bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
        <div class="flex items-center gap-6 text-sm text-gray-300">
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">W</kbd>
            <span>Accelerate</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">S</kbd>
            <span>Brake</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 {nitroBlocked ? 'bg-red-700' : 'bg-gray-700'} rounded text-xs">SHIFT</kbd>
            <span class="{nitroBlocked ? 'text-red-400' : ''}">
              {nitroBlocked ? 'Nitro Blocked' : 'Nitro'}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">E</kbd>
            <span>Exit</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}