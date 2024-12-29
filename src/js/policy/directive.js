// What the policy asks a car to do: the lane to be in, the speed to
// hold, a lateral offset inside the lane and the signals to show
class Directive{
    constructor(lane,speed){
        this.lane=lane;
        this.speed=speed;
        this.offset=0;
        this.hazards=false;
        this.reasons=[];
    }

    changeLane(lane,reason){
        this.lane=lane;
        this.reasons.push(reason);
    }

    limitSpeed(speed,reason){
        if(speed<this.speed){
            this.speed=Math.max(0,speed);
            this.reasons.push(reason);
        }
    }

    shift(offset,reason){
        this.offset=offset;
        this.reasons.push(reason);
    }

    signalHazards(reason){
        this.hazards=true;
        this.reasons.push(reason);
    }
}
