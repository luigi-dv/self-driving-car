// V2V_VISUAL_SIGNALS / brief hazards after a merge
// A short flash of the hazard lights thanks the driver who left room.
class CourtesyHazardsRule extends PolicyRule{
    static stage=PolicyStage.SIGNAL;

    static isEnabled(profile){
        return profile.mapsSignal(
            "brief_hazards_after_merge","COURTESY_ACKNOWLEDGMENT"
        );
    }

    plan(perception,directive,memory){
        if(memory.lane!=null && memory.lane!=perception.lane){
            const rear=perception.rear(perception.lane);
            if(rear && !rear.vehicle.isObstacle
                && rear.gap<3*Settings.planner.safeGap){
                memory.frames=Settings.signals.courtesyFrames;
            }
        }
        memory.lane=perception.lane;

        if(memory.frames>0){
            memory.frames--;
            directive.signalHazards("Thank-you hazards");
        }
    }
}

PolicyOrchestrator.register(CourtesyHazardsRule);
