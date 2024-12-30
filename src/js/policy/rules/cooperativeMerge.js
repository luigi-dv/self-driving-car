// MERGE_PROTOCOL / PRIORITY_SHARED_COOPERATIVE
// On the mainline, move from lane 0 to lane 1 ahead of time when it is
// clear, to make room for the traffic coming from the ramp.
class CooperativeMergeRule extends PolicyRule{
    static stage=PolicyStage.MERGE;

    static isEnabled(profile){
        return profile.merge.mainline_priority=="SHARED_COOPERATIVE"
            && profile.merge.mainline_courtesy_lane_shift===true;
    }

    plan(perception,directive,memory){
        if(perception.lane!=0 && directive.lane!=0){
            return;
        }
        const incoming=perception.merging().some(
            e=>e.ahead || e.gap<Settings.planner.safeGap
        );
        if(!incoming){
            return;
        }
        if(perception.lane!=0){
            directive.changeLane(perception.lane,"Leave lane 0 to ramp traffic");
        }else if(perception.canEnter(1)){
            directive.changeLane(1,"Courtesy lane shift for ramp traffic");
        }
    }
}

PolicyOrchestrator.register(CooperativeMergeRule);
