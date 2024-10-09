<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Pedometer Coins</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="coin-display">
        <h2>Your Coins: {{ coins }}</h2>
        <p v-if="!motionSupported">Motion tracking not available on this device!</p>
      </div>

      <!-- Slot Machine Section -->
      <div class="slot-machine--new">
        <div class="slot-machine--new--overlay"></div>

        <!-- Column 1 -->
        <div class="column">
          <div
            v-for="index in displayIndices"
            :key="'col1-' + index"
            :class="['field', isWinningField(0, index) ? 'winning-field' : '']"
          >
            {{ symbolsCol1[index] }}
          </div>
        </div>

        <!-- Column 2 -->
        <div class="column">
          <div
            v-for="index in displayIndices"
            :key="'col2-' + index"
            :class="['field', isWinningField(1, index) ? 'winning-field' : '']"
          >
            {{ symbolsCol2[index] }}
          </div>
        </div>

        <!-- Column 3 -->
        <div class="column">
          <div
            v-for="index in displayIndices"
            :key="'col3-' + index"
            :class="['field', isWinningField(2, index) ? 'winning-field' : '']"
          >
            {{ symbolsCol3[index] }}
          </div>
        </div>
      </div>

      <div style="height: 70px">
        <p class="bet-info">Bet: {{ betAmount }} coins</p>
        <p v-show="gameResult" class="game-result">{{ gameResult }}</p>
      </div>
      <div style="text-align: center;">
        <ion-button @click="start" color="primary">Start</ion-button>
        <ion-button @click="stop" color="secondary">Stop</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Motion } from '@capacitor/motion';

export default {
  setup() {
    // Reactive state variables
    const coins = ref<number>(50);
    const betAmount = ref<number>(10);
    const gameResult = ref<string>('');
    const motionSupported = ref<boolean>(true);

    // Slot machine symbols and columns
    const slotSymbols = ['🍒', '🍋', '🍉', '⭐', '💎'];
    const symbolsCol1 = ref<string[]>([]);
    const symbolsCol2 = ref<string[]>([]);
    const symbolsCol3 = ref<string[]>([]);

    // Display indices for the visible symbols
    const displayIndices = [4, 5, 6];

    // Winning positions to highlight
    const winningPositions = ref<number[]>([]);

    // Variables for motion tracking
    const accelerationThreshold = 1.5;
    let lastStepTime = Date.now();

    // Control variables
    const running = ref<boolean>(false);
    let intervalId1: number;
    let intervalId2: number;
    let intervalId3: number;

    // Start motion tracking
    const startMotionTracking = () => {
      try {
        Motion.addListener('accel', (event) => {
          const { x, y, z } = event.accelerationIncludingGravity;
          const totalForce = Math.sqrt(x * x + y * y + z * z);
          const currentTime = Date.now();
          if (totalForce > accelerationThreshold && currentTime - lastStepTime > 500) {
            lastStepTime = currentTime;
            coins.value += 1;
          }
        });
      } catch (error) {
        console.error('Motion tracking not supported', error);
        motionSupported.value = false;
      }
    };

    // Start spinning the slot machine
    const start = () => {
      if (coins.value < betAmount.value) {
        gameResult.value = 'Not enough coins to spin!';
        return;
      }
      coins.value -= betAmount.value;
      running.value = true;
      gameResult.value = '';
      winningPositions.value = [];
    };

    // Stop spinning and check the result
    const stop = () => {
      running.value = false;
      checkResult();
    };

    // Check for winning combinations and highlight winning fields
    const checkResult = () => {
      winningPositions.value = [];
      let winnings = 0;

      // Define combinations with their positions
      const combinations = [
        // Rows
        {
          symbols: [symbolsCol1.value[4], symbolsCol2.value[4], symbolsCol3.value[4]],
          positions: [0, 3, 6],
        },
        {
          symbols: [symbolsCol1.value[5], symbolsCol2.value[5], symbolsCol3.value[5]],
          positions: [1, 4, 7],
        },
        {
          symbols: [symbolsCol1.value[6], symbolsCol2.value[6], symbolsCol3.value[6]],
          positions: [2, 5, 8],
        },
        // Columns
        {
          symbols: [symbolsCol1.value[4], symbolsCol1.value[5], symbolsCol1.value[6]],
          positions: [0, 1, 2],
        },
        {
          symbols: [symbolsCol2.value[4], symbolsCol2.value[5], symbolsCol2.value[6]],
          positions: [3, 4, 5],
        },
        {
          symbols: [symbolsCol3.value[4], symbolsCol3.value[5], symbolsCol3.value[6]],
          positions: [6, 7, 8],
        },
        // Diagonals
        {
          symbols: [symbolsCol1.value[4], symbolsCol2.value[5], symbolsCol3.value[6]],
          positions: [0, 4, 8],
        },
        {
          symbols: [symbolsCol1.value[6], symbolsCol2.value[5], symbolsCol3.value[4]],
          positions: [2, 4, 6],
        },
      ];

      // Check each combination
      combinations.forEach((combination) => {
        if (new Set(combination.symbols).size === 1) {
          winnings += betAmount.value * 2;
          winningPositions.value.push(...combination.positions);
        }
      });

      // Update coins and game result
      if (winnings > 0) {
        coins.value += winnings;
        gameResult.value = `You won ${winnings} coins!`;
      } else {
        gameResult.value = 'You lost!';
      }
    };

    // Function to check if a field is a winning field
    const isWinningField = (columnIndex: number, symbolIndex: number): boolean => {
      const positionIndex = columnIndex * 3 + (symbolIndex - 4);
      return winningPositions.value.includes(positionIndex);
    };

    // Initialize the slot machine columns
    const initializeColumns = () => {
      for (let i = 0; i < 10; i++) {
        symbolsCol1.value.push(slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
        symbolsCol2.value.push(slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
        symbolsCol3.value.push(slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
      }
    };

    onMounted(() => {
      initializeColumns();
      startMotionTracking();

      // Spin column 1
      intervalId1 = setInterval(() => {
        if (running.value) {
          const first = symbolsCol1.value.shift()!;
          symbolsCol1.value.push(first);
        }
      }, 100);

      // Spin column 2
      intervalId2 = setInterval(() => {
        if (running.value) {
          const first = symbolsCol2.value.shift()!;
          symbolsCol2.value.push(first);
        }
      }, 150);

      // Spin column 3
      intervalId3 = setInterval(() => {
        if (running.value) {
          const first = symbolsCol3.value.shift()!;
          symbolsCol3.value.push(first);
        }
      }, 200);
    });

    onBeforeUnmount(() => {
      Motion.removeAllListeners();
      clearInterval(intervalId1);
      clearInterval(intervalId2);
      clearInterval(intervalId3);
    });

    return {
      coins,
      betAmount,
      gameResult,
      motionSupported,
      symbolsCol1,
      symbolsCol2,
      symbolsCol3,
      start,
      stop,
      isWinningField,
      displayIndices,
    };
  },
};
</script>

<style scoped>
.coin-display {
  text-align: center;
  margin-bottom: 20px;
}

.slot-machine--new {
  display: flex;
  justify-content: center;
  position: relative;
  width: 320px;
  margin: 0 auto;
  background-color: #000;
  padding: 10px;
  border-radius: 10px;
}

.slot-machine--new .column {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 5px;
}

.field {
  font-size: 66px;
  height: 100px;
  width: 100px;
  background: white;
  border: 1px solid black;
  margin: 5px 0;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.winning-field {
  background-color: yellow;
  border: 2px solid red;
}

.bet-info {
  text-align: center;
  margin-top: 10px;
  font-weight: bold;
}

.game-result {
  text-align: center;
  font-size: 1.5em;
  margin-top: 10px;
}

ion-button {
  margin: 10px;
}
</style>
