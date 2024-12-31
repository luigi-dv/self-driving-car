// EXCEPTION_HANDLERS / EMERGENCY_MOVE_OVER
// Flashing lights stopped on the shoulder: leave the lane next to them
// or, when that lane is taken, slow down well below the limit.
class EmergencyMoveOverRule extends PolicyRule{
    static stage=PolicyStage.EXCEPTION;

    static isEnabled(profile){
        const moveOver=profile.exceptions.emergency_move_over||{};
        return moveOver.enabled===true;
    }

    constructor(profile){
        super(profile);
        const config=profile.exceptions.emergency_move_over;
        this.triggerDistance=Units.toPixels(config.trigger_distance_m);
        this.passSpeed=Units.toSpeed(
            Settings.speedLimitKmh
            -PolicyProfile.speedKmh(config,"fallback_speed_reduction")
        );
    }

    plan(perception,directive,memory){
        const stopped=perception.shoulder.find(
            e=>this.#isStoppedEmergency(e)
                && (e.ahead?e.gap<this.triggerDistance:e.gap<0)
        );
        if(stopped==null){
            return;
        }

        const adjacent=this.#getAdjacentLane(perception,stopped);
        const away=adjacent==0?1:adjacent-1;
        if(perception.lane!=adjacent){
            if(directive.lane==adjacent){
                directive.changeLane(
                    perception.lane,"Keep clear of emergency vehicle"
                );
            }
        }else if(perception.canEnter(away)){
            directive.changeLane(away,"Move over for emergency vehicle");
        }else{
            directive.limitSpeed(
                this.passSpeed,"Slow down past emergency vehicle"
            );
        }
    }

    audit(perception,directive,memory){
        const passed=perception.passed.find(
            e=>this.#isStoppedEmergency(e)
        );
        if(passed
            && perception.lane==this.#getAdjacentLane(perception,passed)
            && perception.speed>this.passSpeed+0.2){
            return {
                severity:"SOFT",
                message:"Passed an emergency vehicle too fast"
            };
        }
        return null;
    }

    #isStoppedEmergency(entry){
        return entry.vehicle.signals.flashing
            && entry.vehicle.speed<0.1
            && (entry.lane<0 || entry.lane>entry.vehicle.road.laneCount-1);
    }

    #getAdjacentLane(perception,entry){
        return entry.lane<0?0:perception.laneMax;
    }
}

PolicyOrchestrator.register(EmergencyMoveOverRule);
