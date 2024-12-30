// LANE_SELECTION / MODE_STRICT_DISCIPLINE
// Stay in the base lane, use the next one only to overtake and return
// as soon as there is a safe gap. Cruising further in while the lane
// outside is clear is middle-lane hogging.
class StrictDisciplineRule extends PolicyRule{
    static stage=PolicyStage.LANE_SELECTION;

    static isEnabled(profile){
        return profile.laneSelection.mode=="STRICT_DISCIPLINE";
    }

    constructor(profile){
        super(profile);
        const lane=parseInt(
            String(profile.laneSelection.default_lane).replace("lane_","")
        );
        this.baseLane=isNaN(lane)?0:lane;
        this.returnImmediately=
            profile.laneSelection.return_to_base_immediately!==false;
        this.severity=PolicyRule.penaltyToSeverity(
            profile.laneSelection.middle_lane_cruising_penalty
        );
    }

    plan(perception,directive,memory){
        if(this.returnImmediately
            && directive.lane>this.baseLane
            && this.#canReturn(perception,directive)){
            directive.changeLane(directive.lane-1,"Return to base lane");
        }
    }

    audit(perception,directive,memory){
        const hogging=perception.lane>this.baseLane
            && directive.lane<perception.lane;
        memory.frames=hogging?(memory.frames||0)+1:0;

        if(this.severity && memory.frames>Settings.planner.hogFrames){
            memory.frames=0;
            return {
                severity:this.severity,
                message:"Middle-lane hogging"
            };
        }
        return null;
    }

    // Safe_Gap: room in the lane outside, nothing slow there to overtake
    // again right away and no overtake still going on in this lane
    #canReturn(perception,directive){
        const patience=2*Settings.planner.timeToCollision;
        const lane=directive.lane;
        return perception.canEnter(lane-1)
            && perception.timeToCollision(lane-1,directive.speed)>patience
            && perception.timeToCollision(lane,directive.speed)>patience;
    }
}

PolicyOrchestrator.register(StrictDisciplineRule);
