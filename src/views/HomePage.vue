<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Pedometer Coins</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div>
        <h2>Your Coins: {{ coins }}</h2>
        <p v-if="!motionSupported">Motion tracking not available on this device!</p>
      </div>

      <!-- Slot Machine Section -->
      <div class="slot-machine">
        <h3>One-Eyed Bandit Slot Machine</h3>
        <div class="slots">
          <span>{{ slot1 }}</span> | <span>{{ slot2 }}</span> | <span>{{ slot3 }}</span>
        </div>

        <p>Bet: {{ betAmount }} coins</p>
        <p v-if="gameResult">{{ gameResult }}</p>

        <!-- Button to Spin the Slot Machine -->
        <ion-button @click="spinSlotMachine" :disabled="coins < betAmount">Spin (Bet 10 Coins)</ion-button>

        <!-- Reset Button -->
        <ion-button @click="resetGame">Reset Game</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Motion } from '@capacitor/motion';
import { Plugins } from '@capacitor/core';
const { BackgroundTask } = Plugins;
export default {
  setup() {
    // Define state variables using Vue 3's Composition API
    const coins = ref<number>(0);          // Tracks coins (1 motion event = 1 coin)
    const betAmount = ref<number>(10);     // Fixed bet amount for each spin
    const slot1 = ref<string>('');         // Slot reel 1 result
    const slot2 = ref<string>('');         // Slot reel 2 result
    const slot3 = ref<string>('');         // Slot reel 3 result
    const gameResult = ref<string>('');    // Result of the slot machine spin
    const slotSymbols = ref<string[]>(['🍒', '🍋', '🍉', '⭐', '💎']); // Slot machine symbols
    const motionSupported = ref<boolean>(true); // To check if motion tracking is available

    const accelerationThreshold = 1.5; // Set a threshold to avoid false step detection
    let lastStepTime = Date.now();

    // Start tracking motion to simulate step tracking
    const startMotionTracking = () => {
      try {
        Motion.addListener('accel', (event) => {
          const { x, y, z } = event.accelerationIncludingGravity;

          // Calculate the total force on the device (ignore small movements)
          const totalForce = Math.sqrt(x * x + y * y + z * z);

          // Detect a "step" only if the force exceeds the threshold and sufficient time has passed
          const currentTime = Date.now();
          if (totalForce > accelerationThreshold && currentTime - lastStepTime > 500) {
            lastStepTime = currentTime; // Update last step time
            coins.value += 1; // Increment coin (step count)
          }
        });
      } catch (error) {
        console.error("Motion tracking not supported", error);
        motionSupported.value = false;
      }
    };

    // Slot machine logic
    const spinSlotMachine = () => {
      if (coins.value >= betAmount.value) {
        // Deduct the bet amount
        coins.value -= betAmount.value;

        // Generate random values for each slot
        slot1.value = getRandomSlot();
        slot2.value = getRandomSlot();
        slot3.value = getRandomSlot();

        // Check slot result
        checkSlotResult();
      } else {
        gameResult.value = "Not enough coins to spin!";
      }
    };

    // Generate a random slot symbol
    const getRandomSlot = (): string => {
      const randomIndex = Math.floor(Math.random() * slotSymbols.value.length);
      return slotSymbols.value[randomIndex];
    };

    // Check the result of the slot machine spin
    const checkSlotResult = () => {
      if (slot1.value === slot2.value && slot2.value === slot3.value) {
        // Jackpot! All three symbols match
        coins.value += betAmount.value * 10;  // Win 10x the bet
        gameResult.value = `Jackpot! You won ${betAmount.value * 10} coins!`;
      } else if (slot1.value === slot2.value || slot2.value === slot3.value || slot1.value === slot3.value) {
        // Partial match
        coins.value += betAmount.value * 2;  // Win 2x the bet
        gameResult.value = `You won ${betAmount.value * 2} coins!`;
      } else {
        // No match
        gameResult.value = "You lost! Better luck next time!";
      }
    };

    // Reset the game
    const resetGame = () => {
      gameResult.value = "";
      slot1.value = slot2.value = slot3.value = '';
    };

    // Continue background task when the app is minimized
    const continueBackgroundTask = () => {
      setTimeout(() => {
        // Keep tracking motion or other necessary operations
      }, 2000);
    };

    onMounted(() => {
      // Start motion tracking on component mount
      startMotionTracking();

      // Enable background task using Capacitor's BackgroundTask plugin
      BackgroundTask.beforeExit(() => {
        continueBackgroundTask();
      });
    });

    onBeforeUnmount(() => {
      // Remove motion listeners when the component is destroyed
      Motion.removeAllListeners();
    });

    return {
      coins,
      betAmount,
      slot1,
      slot2,
      slot3,
      gameResult,
      motionSupported,
      spinSlotMachine,
      resetGame,
    };
  }
};
</script>

<style scoped>
h2 {
  font-size: 2em;
  text-align: center;
  margin-top: 20px;
}

.slot-machine {
  text-align: center;
  margin-top: 40px;
}

.slots {
  font-size: 2em;
  margin: 20px 0;
}

ion-button {
  margin: 10px;
}
</style>
