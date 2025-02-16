/*
* Number Factory - A number and math factory game 
* Copyright (C) 2025  Hans Milling
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
const gridSize = 1024;
const cellSize = 10;
const beltWidthPercentage = 0.6;
const beltAnimationSteps = 50;
const beltAnimationSpeed = 10;
const beltSpeed = 2;
const tickDelay = 50;
const numbersPerSecondFromExtractors = 4;

const levelRequirements = [
    { number: 1, requiredCount: 10, unlocks: "Adder" },
    { number: 2, requiredCount: 20, unlocks: null },
    { number: 3, requiredCount: 35, unlocks: "Extraction 2" },
    { number: 5, requiredCount: 40, unlocks: "Bridge" },
    { number: 10, requiredCount: 50, unlocks: "Extraction 3" },
    { number: 19, requiredCount: 100, unlocks: "Extraction 4" },
    { number: 27, requiredCount: 150, unlocks: "Multiplier" },
    { number: 36, requiredCount: 300, unlocks: "Extraction 5" },
    { number: 47, requiredCount: 450, unlocks: "Extraction 6" },
    { number: 50, requiredCount: 500, unlocks: "Belt Priorities" },
    { number: 82, requiredCount: 600, unlocks: "Extraction 7" },
    { number: 174, requiredCount: 800, unlocks: "Extraction 8" },
    { number: 248, requiredCount: 1000, unlocks: "Subtractor" },
    { number: 324, requiredCount: 2000, unlocks: "Extraction 9" },
    { number: 466, requiredCount: 3000, unlocks: "Extraction 11" },
    { number: 594, requiredCount: 4000, unlocks: "Divider" },
    { number: 631, requiredCount: 5000, unlocks: "Extraction 12" },
    { number: 727, requiredCount: 6000, unlocks: "Extraction 13" },
    { number: 891, requiredCount: 7000, unlocks: "Exponentiator" },
    { number: 928, requiredCount: 8000, unlocks: "Extraction 14" },
    { number: 1779, requiredCount: 9000, unlocks: "Extraction 15" },
    { number: 2805, requiredCount: 10000, unlocks: "Storage" },
    { number: 3366, requiredCount: 10500, unlocks: "Extraction 16" },
    { number: 4860, requiredCount: 11000, unlocks: "Extraction 17" },
    { number: 5445, requiredCount: 11500, unlocks: "Extraction 18" },
    { number: 6667, requiredCount: 12000, unlocks: "Extraction 19" },
    { number: 7512, requiredCount: 12500, unlocks: "Extraction 20" },
    { number: 8133, requiredCount: 13000, unlocks: "Extraction 21" },
    { number: 9646, requiredCount: 13500, unlocks: "Extraction 22" },
    { number: 10904, requiredCount: 14000, unlocks: "Extraction 23" },
    { number: 12675, requiredCount: 14500, unlocks: "Extraction 24" },
    { number: 14772, requiredCount: 14500, unlocks: "Extraction 25" },
    { number: 18962, requiredCount: 14500, unlocks: "Extraction 26" },
    { number: 20158, requiredCount: 14500, unlocks: "Extraction 27" },
    { number: 23431, requiredCount: 14500, unlocks: "Extraction 28" },
    { number: 24755, requiredCount: 14500, unlocks: "Extraction 29" },
    { number: 27432, requiredCount: 14500, unlocks: "Extraction 31" },
    { number: 29296, requiredCount: 14500, unlocks: "Extraction 32" },
    { number: 32550, requiredCount: 14500, unlocks: "Extraction 33" },
    { number: 35541, requiredCount: 14500, unlocks: "Extraction 34" }
];