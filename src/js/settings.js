const Settings={
    carCount:100,
    startY:100,
    laneCount:3,
    laneWidth:60,
    region:"EU_STRICT",
    speedLimitKmh:100,
    seedBaselineBrain:true,

    units:{
        kmhPerSpeed:40,
        kmhPerMph:1.609,
        pixelsPerMeter:4
    },
    generation:{
        maxFrames:7200,
        stallFrames:300,
        minProgress:20,
        dropBehind:1200
    },
    planner:{
        range:500,
        safeGap:70,
        reactionFrames:30,
        timeToCollision:150,
        brakingHorizon:40,
        rearDeltaKmh:10,
        hogFrames:180,
        yieldFrames:240,
        brakeFrames:8,
        speedTolerance:0.25
    },
    traffic:{
        shuffleScenarios:false,
        spawnAhead:700,
        lookBehind:900,
        lookAhead:3000,
        followGap:60,
        minGap:12
    },
    zipper:{
        triggerDistance:600,
        terminalDistance:110,
        earlyTolerance:60,
        gap:20
    },
    corridor:{
        offset:10,
        graceFrames:150
    },
    signals:{
        sustainedFrames:60,
        courtesyFrames:90
    },
    fitness:{
        softPenalty:200,
        speedingWeight:2,
        laneWeight:0.5
    }
};

class Units{
    static toSpeed(kmh){
        return kmh/Settings.units.kmhPerSpeed;
    }

    static toKmh(speed){
        return speed*Settings.units.kmhPerSpeed;
    }

    static toPixels(meters){
        return meters*Settings.units.pixelsPerMeter;
    }
}
