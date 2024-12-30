// MERGE_PROTOCOL / LANE_CLOSURE_ZIPPER
// When the lane ends, drive up to the closure and merge there, one
// vehicle from each lane in turn. Merging early is penalized.
class ZipperMergeRule extends PolicyRule{
    static stage=PolicyStage.MERGE;

    static isEnabled(profile){
        const zipper=profile.merge.zipper_merge||{};
        return zipper.enforced===true
            && zipper.merge_point=="TERMINAL_NODE";
    }

    plan(perception,directive,memory){
        const closure=perception.closure;
        const settings=Settings.zipper;
        if(closure==null || closure.distance>settings.triggerDistance){
            memory.turn=false;
            return;
        }
        const open=closure.lane<perception.laneMax
            ?closure.lane+1
            :closure.lane-1;

        if(perception.lane==open){
            this.#letOneIn(perception,directive,closure);
            return;
        }
        if(perception.lane!=closure.lane){
            return;
        }

        if(closure.distance>settings.terminalDistance){
            directive.changeLane(
                closure.lane,"Zipper: advance to the merge point"
            );
            return;
        }

        // Terminal node: one vehicle of the open lane goes, then us
        const rear=perception.rear(open);
        if(perception.overtakers.some(e=>e.lane==open)
            || rear==null
            || rear.gap>2*Settings.planner.safeGap){
            memory.turn=true;
        }
        if(memory.turn
            && perception.canEnter(open,settings.gap,settings.gap)){
            directive.changeLane(open,"Zipper: merge in turn");
        }else{
            directive.changeLane(closure.lane,"Zipper: wait for the turn");
        }
    }

    audit(perception,directive,memory){
        const closure=perception.closure;
        const settings=Settings.zipper;
        const inZone=closure!=null
            && closure.distance<=settings.triggerDistance
            && closure.distance>0;
        const wasClosing=memory.closing===true;
        memory.closing=inZone && perception.lane==closure.lane;

        if(inZone && wasClosing && !memory.closing
            && closure.distance>
                settings.terminalDistance+settings.earlyTolerance){
            return {
                severity:"SOFT",
                message:"Merged before the end of the lane"
            };
        }
        return null;
    }

    #letOneIn(perception,directive,closure){
        const waiting=perception.lead(closure.lane);
        if(waiting && waiting.vehicle.intent=="MERGE"
            && waiting.gap<2*Settings.planner.safeGap){
            directive.limitSpeed(
                waiting.vehicle.speed+0.4,
                "Zipper: let one vehicle in"
            );
        }
    }
}

PolicyOrchestrator.register(ZipperMergeRule);
