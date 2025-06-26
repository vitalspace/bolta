<script lang="ts">
  import { isInVehicle, gameState, keys } from "../../stores/stores";
  import { Gauge, Zap, LogOut } from "@lucide/svelte";

  let {
    currentSpeed = 0,
    maxSpeed = 100,
    nitroLevel = 100,
    isNitroActive = false
  } = $props();

  // Calcular el porcentaje del velocímetro
  const speedPercentage = $derived(Math.min((currentSpeed / maxSpeed) * 100, 100));
  const nitroPercentage = $derived(Math.max(0, Math.min(nitroLevel, 100)));

  // Determinar el color del velocímetro basado en la velocidad
  const speedColor = $derived(speedPercentage < 30 
    ? 'text-green-400' 
    : speedPercentage < 70 
    ? 'text-yellow-400' 
    : 'text-red-400');

  // Función para salir del vehículo
  const exitVehicle = () => {
    // Simular presionar E para salir
    const event = new KeyboardEvent('keydown', { keyCode: 69 });
    document.dispatchEvent(event);
  };
</script>

{#if $isInVehicle}
  <div class="fixed inset-0 pointer-events-none z-50">
    <!-- Velocímetro - Esquina inferior izquierda -->
    <div class="absolute bottom-8 left-8 pointer-events-auto">
      <div class="bg-black/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <!-- Velocímetro circular -->
        <div class="relative w-32 h-32 mb-4">
          <!-- Círculo de fondo -->
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <!-- Fondo del círculo -->
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgb(55, 65, 81)"
              stroke-width="8"
            />
            <!-- Progreso del velocímetro -->
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              stroke-width="8"
              stroke-linecap="round"
              stroke-dasharray="283"
              stroke-dashoffset={283 - (283 * speedPercentage) / 100}
              class="transition-all duration-300 {speedColor}"
            />
          </svg>
          
          <!-- Velocidad en el centro -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-2xl font-bold text-white">{Math.round(currentSpeed)}</span>
            <span class="text-xs text-gray-400">KM/H</span>
          </div>
        </div>

        <!-- Indicador de velocidad -->
        <div class="text-center">
          <div class="flex items-center justify-center gap-2 mb-2">
            <Gauge class="w-4 h-4 text-gray-400" />
            <span class="text-sm text-gray-300">Velocidad</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300 {speedColor.replace('text-', 'bg-')}"
              style="width: {speedPercentage}%"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de Nitro - Esquina inferior derecha -->
    <div class="absolute bottom-8 right-8 pointer-events-auto">
      <div class="bg-black/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <!-- Indicador de Nitro -->
        <div class="flex items-center gap-3 mb-4">
          <div class="relative">
            <Zap class="w-8 h-8 {isNitroActive ? 'text-blue-400 animate-pulse' : 'text-gray-400'}" />
            {#if isNitroActive}
              <div class="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
            {/if}
          </div>
          <div>
            <div class="text-white font-semibold">NITRO</div>
            <div class="text-sm text-gray-400">{Math.round(nitroPercentage)}%</div>
          </div>
        </div>

        <!-- Barra de Nitro -->
        <div class="w-32 bg-gray-700 rounded-full h-3 mb-4">
          <div 
            class="h-3 rounded-full transition-all duration-300 {nitroPercentage > 20 ? 'bg-blue-400' : 'bg-red-400'}"
            style="width: {nitroPercentage}%"
          ></div>
        </div>

        <!-- Controles de Nitro -->
        <div class="text-center">
          <div class="text-xs text-gray-400 mb-2">
            {#if $keys.shift.isPressed}
              <span class="text-blue-400 font-semibold">NITRO ACTIVO</span>
            {:else}
              <span>Mantén SHIFT para nitro</span>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- Botón de Salida - Esquina superior derecha -->
    <div class="absolute top-8 right-8 pointer-events-auto">
      <button
        onclick={exitVehicle}
        class="bg-red-600/80 hover:bg-red-600 backdrop-blur-sm rounded-xl p-4 border border-red-400/30 transition-all duration-200 hover:scale-105 group"
      >
        <div class="flex items-center gap-3">
          <LogOut class="w-5 h-5 text-white group-hover:animate-pulse" />
          <div class="text-white">
            <div class="font-semibold">Salir</div>
            <div class="text-xs opacity-75">Presiona E</div>
          </div>
        </div>
      </button>
    </div>

    <!-- Controles en pantalla - Parte inferior central -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
      <div class="bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
        <div class="flex items-center gap-6 text-sm text-gray-300">
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">W</kbd>
            <span>Acelerar</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">S</kbd>
            <span>Frenar</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">SHIFT</kbd>
            <span>Nitro</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">E</kbd>
            <span>Salir</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}