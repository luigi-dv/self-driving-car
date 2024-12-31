// V2V_VISUAL_SIGNALS / rear high-beam flash
// A vehicle flashing from behind wants to go faster: return to the
// lane outside when it is safe.
class HighBeamYieldRule extends PolicyRule{
    static stage=PolicyStage.SIGNAL;

    static isEnabled(profile){
        return profile.mapsSignal(
            "rear_high_beam_flash","YIELD_LANE_WHEN_SAFE"
        );
    }

    plan(perception,directive,memory){
        if(this.#canYield(perception)){
            directive.changeLane(
                perception.lane-1,"Yield to high-beam flash"
            );
        }
    }

    audit(perception,directive,memory){
        memory.frames=this.#canYield(perception)
            ?(memory.frames||0)+1
            :0;
        if(memory.frames>Settings.planner.yieldFrames){
            memory.frames=0;
            return {
                severity:"SOFT",
                message:"Ignored a high-beam flash"
            };
        }
        return null;
    }

    #canYield(perception){
        const rear=perception.rear(perception.lane);
        return perception.lane>0
            && rear!=null
            && rear.vehicle.signals.highBeam
            && perception.canEnter(perception.lane-1);
    }
}

PolicyOrchestrator.register(HighBeamYieldRule);
