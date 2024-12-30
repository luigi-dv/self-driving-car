// LANE_SELECTION / MODE_FLEXIBLE_CRUISE
// Any lane is fine for steady cruising, but the fastest lane has to be
// given up when a faster vehicle comes from behind.
class FlexibleCruiseRule extends PolicyRule{
    static stage=PolicyStage.LANE_SELECTION;

    static isEnabled(profile){
        return profile.laneSelection.mode=="FLEXIBLE_CRUISE";
    }

    plan(perception,directive,memory){
        if(this.#mustYield(perception)){
            directive.changeLane(
                perception.lane-1,
                "Yield fast lane to faster traffic"
            );
        }
    }

    audit(perception,directive,memory){
        memory.frames=this.#mustYield(perception)
            ?(memory.frames||0)+1
            :0;
        if(memory.frames>Settings.planner.yieldFrames){
            memory.frames=0;
            return {
                severity:"SOFT",
                message:"Blocking the fast lane"
            };
        }
        return null;
    }

    #mustYield(perception){
        if(!this.profile.laneSelection.yield_lane_max_to_faster_rear
            || perception.laneMax==0
            || perception.lane!=perception.laneMax){
            return false;
        }
        const rear=perception.rear(perception.lane);
        return rear!=null
            && !rear.vehicle.isObstacle
            && Units.toKmh(rear.closing)>Settings.planner.rearDeltaKmh
            && perception.canEnter(perception.lane-1);
    }
}

PolicyOrchestrator.register(FlexibleCruiseRule);
