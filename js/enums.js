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

const DirectionType = Object.freeze({
    HORIZONTAL: 0,
    VERTICAL: 1
});

const CellType = Object.freeze({
    EMPTY: 0,
    NUMBER: 1,
    NUMBERBUFFER: 2,
    CONVEYER: 3,
    TARGET: 4,
    JUNCTION: 5,
    EXTRACTOR: 6,
    ADDER_A: 7,
    ADDER_B: 8,
    ADDER_OUT: 9
});

const DrawModeType = Object.freeze({
    NONE: 0,
    CONVEYER: 1,
    EXTRACTOR: 2,
    DEMOLISHER: 3,
    ADDER: 4,
    SUBTRACTOR: 5,
    MULTIPLIER: 6,
    DIVIDER: 7
});

const ComponentRotation = Object.freeze({
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
});