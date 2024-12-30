// MERGE_PROTOCOL / PRIORITY_MAINLINE_ABSOLUTE
// Ramp traffic yields. On the mainline keep speed and lane, and do not
// brake abruptly for a merging vehicle.
class MainlinePriorityRule extends PolicyRule{
    static stage=PolicyStage.MERGE;

    static isEnabled(profile){
        return profile.merge.mainline_priority=="ABSOLUTE";
    }

    plan(perception,directive,memory){
        if(this.#isBesideRamp(perception)){
            directive.reasons.push("Mainline priority: hold speed and lane");
        }
    }

    audit(perception,directive,memory){
        const braking=memory.speed!=null
            && memory.speed-perception.speed>=0.2
            && directive.speed>=perception.speed
            && this.#isBesideRamp(perception);
        memory.speed=perception.speed;
        memory.frames=braking?(memory.frames||0)+1:0;

        if(memory.frames>=Settings.planner.brakeFrames){
            memory.frames=0;
            return {
                severity:"SOFT",
                message:"Abrupt braking for merging traffic"
            };
        }
        return null;
    }

    #isBesideRamp(perception){
        return perception.lane==0 && perception.merging().some(
            e=>e.gap<2*Settings.planner.safeGap
        );
    }
}

PolicyOrchestrator.register(MainlinePriorityRule);
