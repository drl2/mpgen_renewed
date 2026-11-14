/**
 * DiceRoller.js
 * 
 * Handles all dice rolling operations for character generation.
 * Provides methods for rolling various dice (D100, D20, custom ranges).
 * 
 * Replaces Python randrange(start, end) with JavaScript equivalent:
 * Math.floor(Math.random() * (max - min)) + min
 */

export class DiceRoller {
  /**
   * Roll a 100-sided die (D100) - common for MPGEN character generation
   * Returns value between 1-100 inclusive
   * @returns {number} - Roll result (1-100)
   */
  static rollD100() {
    return Math.floor(Math.random() * 100) + 1;
  }

  /**
   * Roll a 20-sided die (D20)
   * Returns value between 1-20 inclusive
   * @returns {number} - Roll result (1-20)
   */
  static rollD20() {
    return Math.floor(Math.random() * 20) + 1;
  }

  /**
   * Roll dice with custom range
   * Equivalent to Python randrange(min_val, max_val + 1)
   * @param {number} minVal - Minimum value (inclusive)
   * @param {number} maxVal - Maximum value (inclusive)
   * @returns {number} - Roll result within range
   */
  static roll(minVal, maxVal) {
    if (minVal > maxVal) {
      throw new Error(`Invalid range: min (${minVal}) > max (${maxVal})`);
    }
    return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
  }

  /**
   * Roll multiple dice and sum results
   * @param {number} numDice - Number of dice to roll
   * @param {number} sides - Number of sides per die
   * @returns {number} - Sum of all rolls
   */
  static rollMultiple(numDice, sides) {
    let sum = 0;
    for (let i = 0; i < numDice; i++) {
      sum += Math.floor(Math.random() * sides) + 1;
    }
    return sum;
  }

  /**
   * Roll with advantages (roll multiple, take best)
   * Common for ability score generation in RPGs
   * @param {number} numRolls - Number of rolls to make
   * @returns {number} - Highest roll from all attempts
   */
  static rollWithAdvantage(numRolls = 2) {
    let best = 0;
    for (let i = 0; i < numRolls; i++) {
      best = Math.max(best, this.rollD100());
    }
    return best;
  }

  /**
   * Roll with disadvantage (roll multiple, take worst)
   * @param {number} numRolls - Number of rolls to make
   * @returns {number} - Lowest roll from all attempts
   */
  static rollWithDisadvantage(numRolls = 2) {
    let worst = 101;
    for (let i = 0; i < numRolls; i++) {
      worst = Math.min(worst, this.rollD100());
    }
    return worst;
  }

  /**
   * Generate random weighted selection from array
   * Useful for biased random choices
   * @param {Array} items - Array of items to choose from
   * @param {Array} weights - Array of weight values (higher = more likely)
   * @returns {*} - Randomly selected item
   */
  static weightedRandom(items, weights) {
    if (items.length !== weights.length) {
      throw new Error('Items and weights arrays must be same length');
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }

  /**
   * Shuffle array in-place (Fisher-Yates algorithm)
   * @param {Array} array - Array to shuffle
   * @returns {Array} - Shuffled array (same reference)
   */
  static shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

export default DiceRoller;
