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
const tickDelay = 40;
const numbersPerSecondFromExtractors = 4;

const nextLevelRequirements = [
    { level: 1, number: 1, requiredCount: 10, unlocks: "Adder" },
    { level: 2, number: 2, requiredCount: 20, unlocks: null },
    { level: 3, number: 3, requiredCount: 35, unlocks: "Extraction 2" },
    { level: 4, number: 5, requiredCount: 40, unlocks: "Bridge" },
    { level: 5, number: 10, requiredCount: 50, unlocks: "Extraction 3" },
    { level: 6, number: 19, requiredCount: 100, unlocks: "Extraction 4" },
    { level: 7, number: 27, requiredCount: 150, unlocks: "Multiplier" },
    { level: 8, number: 36, requiredCount: 300, unlocks: "Extraction 5" },
    { level: 9, number: 47, requiredCount: 450, unlocks: "Extraction 6" },
    { level: 10, number: 50, requiredCount: 500, unlocks: "Belt Priorities" },
    { level: 11, number: 82, requiredCount: 600, unlocks: "Extraction 7" },
    { level: 12, number: 174, requiredCount: 800, unlocks: "Extraction 8" },
    { level: 13, number: 248, requiredCount: 1000, unlocks: "Subtractor" },
    { level: 14, number: 324, requiredCount: 2000, unlocks: "Extraction 9" },
    { level: 15, number: 466, requiredCount: 3000, unlocks: "Extraction 11" },
    { level: 16, number: 594, requiredCount: 4000, unlocks: "Divider" },
    { level: 17, number: 631, requiredCount: 5000, unlocks: "Extraction 12" },
    { level: 18, number: 727, requiredCount: 6000, unlocks: "Extraction 13" },
    { level: 19, number: 891, requiredCount: 7000, unlocks: "Exponentiator" },
    { level: 20, number: 928, requiredCount: 8000, unlocks: "Extraction 14" },
    { level: 21, number: 1779, requiredCount: 9000, unlocks: "Extraction 15" },
    { level: 22, number: 2805, requiredCount: 10000, unlocks: "Storage" },
    { level: 23, number: 3366, requiredCount: 10500, unlocks: "Extraction 16" },
    { level: 24, number: 4860, requiredCount: 11000, unlocks: "Extraction 17" },
    { level: 25, number: 5445, requiredCount: 11500, unlocks: "Extraction 18" },
    { level: 26, number: 6667, requiredCount: 12000, unlocks: "Extraction 19" },
    { level: 27, number: 7512, requiredCount: 12500, unlocks: "Extraction 20" },
    { level: 28, number: 8133, requiredCount: 13000, unlocks: "Extraction 21" },
    { level: 29, number: 9646, requiredCount: 13500, unlocks: "Extraction 22" },
    { level: 30, number: 10904, requiredCount: 14000, unlocks: "Extraction 23" },
    { level: 31, number: 12675, requiredCount: 14500, unlocks: "Extraction 24" },
    { level: 32, number: 14772, requiredCount: 14500, unlocks: "Extraction 25" },
    { level: 33, number: 18962, requiredCount: 14500, unlocks: "Extraction 26" },
    { level: 34, number: 20158, requiredCount: 14500, unlocks: "Extraction 27" },
    { level: 35, number: 23431, requiredCount: 14500, unlocks: "Extraction 28" },
    { level: 36, number: 24755, requiredCount: 14500, unlocks: "Extraction 29" },
    { level: 37, number: 27432, requiredCount: 14500, unlocks: "Extraction 31" },
    { level: 38, number: 29296, requiredCount: 14500, unlocks: "Extraction 32" },
    { level: 39, number: 32550, requiredCount: 14500, unlocks: "Extraction 33" },
    { level: 40, number: 35541, requiredCount: 14500, unlocks: "Extraction 34" }
];