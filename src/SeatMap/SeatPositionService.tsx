import React from 'react';

import { SeatConfig } from '../config/SeatConfig';
import { SeatPosition } from './SeatMap';

const symbol = "-"
export class SeatPositionService extends React.Component {
    seatPositionMap: { [seatId: string]: SeatPosition; } = {};
    constructor(props: any) {
        super(props);
        this.state = {
            presenceLoaded: false,
            usersPresence: []
        };
        SeatConfig.map(group => {
            let incrimentDirection = "UpDown";
            let deltaX = group.delta;
            let deltaY = group.delta;
            switch (group.direction) {
                case "right":
                    incrimentDirection = "RightLeft";
                    break;
                case "down":
                    deltaY = -deltaY
                    break;
                case "left":
                    incrimentDirection = "RightLeft";
                    deltaX = -deltaX
                    break;
                default:
                    break;
            }
            var startNum = group.numberStartFrom ? group.numberStartFrom : 1;
            for (let row = 0; row < group.numOfRows; row++) {
                const rowStr = row.toString()
                let currX = group.origin.x + row * deltaX
                let currY = group.origin.y + row * deltaY
                if (incrimentDirection === "UpDown") { currX += row * deltaX } else { currY += row * deltaY }
                for (let seat = startNum; seat < group.seatPerRow + startNum; seat++) {
                    const seatName = group.group.toString() + symbol + rowStr + seat.toString()
                    this.seatPositionMap[seatName] = {
                        x: currX,
                        y: currY
                    }
                    if (incrimentDirection === "UpDown") { currY += deltaY } else { currX += deltaX }
                }
            }
        }
        )
    }

    async getSeatPosition(seatId: string): Promise<SeatPosition | null> {
        if (seatId in this.seatPositionMap) {
            return this.seatPositionMap[seatId];
        } else {
            return null;
        }
    }
}
