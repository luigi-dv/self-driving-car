// An acceleration lane outside lane 0
class RampFeature extends RoadFeature{
    constructor(startY,length){
        super(startY,startY-length);
    }

    draw(ctx,road){
        const inner=(road.laneToX(0)+road.laneToX(-1))/2;
        const outer=2*road.laneToX(-1)-inner;

        ctx.fillStyle=Theme.rampSurface;
        ctx.beginPath();
        ctx.moveTo(inner,this.startY);
        ctx.lineTo(outer,this.startY+200);
        ctx.lineTo(outer,this.endY+80);
        ctx.lineTo(inner,this.endY);
        ctx.closePath();
        ctx.fill();

        ctx.lineWidth=Theme.lineWidth;
        ctx.strokeStyle=Theme.rampEdge;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(inner,this.startY);
        ctx.lineTo(inner,this.endY);
        ctx.stroke();

        ctx.strokeStyle=Theme.rampDivider;
        ctx.setLineDash([10,10]);
        ctx.beginPath();
        ctx.moveTo(inner,this.startY);
        ctx.lineTo(inner,this.endY);
        ctx.stroke();

        ctx.strokeStyle=Theme.rampEdge;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(outer,this.startY+200);
        ctx.lineTo(outer,this.endY+80);
        ctx.lineTo(inner,this.endY);
        ctx.stroke();
    }
}

// Ramp agent: waits for the traffic to come, speeds up along the
// acceleration lane and joins lane 0 when there is a gap. When it has
// to yield and no gap comes, it stops at the end of the lane.
class RampTechnique extends Technique{
    constructor(ramp){
        super();
        this.ramp=ramp;
    }

    drive(vehicle,world){
        if(vehicle.lane==0){
            vehicle.intent=null;
            return this.follow(vehicle,world,vehicle.cruiseSpeed);
        }
        if(world.focusY-vehicle.y>300 && vehicle.age<1200){
            return 0;
        }

        vehicle.intent="MERGE";
        const mustYield=world.profile.merge.ramp_agent_must_yield!==false;
        if(world.isGapFree(vehicle,0,60,mustYield?140:60)){
            vehicle.lane=0;
        }
        const remaining=vehicle.y-vehicle.height/2-this.ramp.endY-80;
        return Math.min(
            this.follow(vehicle,world,vehicle.cruiseSpeed),
            Math.max(0,remaining/30)
        );
    }
}

class RampMergeScenario extends Scenario{
    static title="Ramp merge";
    static length=1800;

    static spawn(traffic,originY,focusY){
        const ramp=traffic.addFeature(new RampFeature(originY+50,650));
        for(let i=0;i<2;i++){
            const vehicle=traffic.spawn(
                -1,originY-i*90,2.2,new RampTechnique(ramp)
            );
            vehicle.speed=0;
            vehicle.maxSpeed=0;
        }
    }
}

ScenarioDirector.register(RampMergeScenario);
