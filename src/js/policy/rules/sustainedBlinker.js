// V2V_VISUAL_SIGNALS / sustained turn signal during a pass
// The vehicle ahead keeps its signal on: it will stay in the passing
// lane, so settle behind it instead of closing in.
class SustainedBlinkerRule extends PolicyRule{
    static stage=PolicyStage.SIGNAL;

    static isEnabled(profile){
        return Object.keys(profile.signals).some(
            signal=>signal.startsWith("sustained_")
                && profile.mapsSignal(
                    signal,"AGENT_REMAINING_IN_PASSING_LANE"
                )
        );
    }

    plan(perception,directive,memory){
        const lead=perception.lead(directive.lane);
        if(lead
            && lead.vehicle.blinkerFrames>Settings.signals.sustainedFrames
            && lead.gap<3*Settings.planner.safeGap){
            directive.limitSpeed(
                lead.vehicle.speed,
                "Vehicle ahead stays in the passing lane"
            );
        }
    }
}

PolicyOrchestrator.register(SustainedBlinkerRule);
