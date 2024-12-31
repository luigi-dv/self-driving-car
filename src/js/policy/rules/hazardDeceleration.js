// V2V_VISUAL_SIGNALS / hazard lights on at speed
// Hazard lights ahead mean the traffic is braking hard further on:
// start slowing down before reaching it.
class HazardDecelerationRule extends PolicyRule{
    static stage=PolicyStage.SIGNAL;

    static isEnabled(profile){
        return profile.mapsSignal(
            "downstream_hazards_on","PREEMPTIVE_DECELERATION"
        );
    }

    plan(perception,directive,memory){
        let nearest=null;
        for(let i=0;i<perception.entries.length;i++){
            const entry=perception.entries[i];
            if(entry.ahead && entry.vehicle.signals.hazards
                && entry.lane>=0 && entry.lane<=perception.laneMax
                && (nearest==null || entry.gap<nearest.gap)){
                nearest=entry;
            }
        }
        if(nearest==null){
            return;
        }

        const share=clamp(nearest.gap/Settings.planner.range,0,1);
        directive.limitSpeed(
            lerp(nearest.vehicle.speed,directive.speed,share),
            "Hazard lights ahead"
        );
    }
}

PolicyOrchestrator.register(HazardDecelerationRule);
