// A stretch of a lane closed for works
class ClosureFeature extends RoadFeature{
    constructor(road,lane,y,length=400){
        super(y+Settings.zipper.triggerDistance,y-length);
        this.closedLane=lane;
        this.y=y;
        this.length=length;

        const x=road.laneToX(lane);
        const half=road.laneWidth/2-2;
        this.left=x-half;
        this.right=x+half;
        this.obstacles=[{
            x:x,
            y:y-length/2,
            width:half*2,
            height:length,
            speed:0,
            isObstacle:true,
            signals:{}
        }];

        const corners=[
            {x:this.left,y:y},
            {x:this.right,y:y},
            {x:this.right,y:y-length},
            {x:this.left,y:y-length}
        ];
        for(let i=0;i<corners.length;i++){
            this.borders.push([corners[i],corners[(i+1)%corners.length]]);
        }
    }

    draw(ctx,road){
        ctx.setLineDash([]);
        ctx.fillStyle=Theme.closureFill;
        ctx.fillRect(this.left,this.y-this.length,
            this.right-this.left,this.length);
        ctx.lineWidth=Theme.lineWidth;
        ctx.strokeStyle=Theme.closureEdge;
        ctx.strokeRect(this.left,this.y-this.length,
            this.right-this.left,this.length);

        ctx.fillStyle=Theme.closureCone;
        for(let i=1;i<=5;i++){
            ctx.beginPath();
            ctx.arc(
                lerp(this.left,this.right,i/6),
                this.y,
                4,0,Math.PI*2
            );
            ctx.fill();
        }
    }
}

// Traffic in the closing lane: drive up to the closure and merge there
class ZipperTechnique extends Technique{
    constructor(closure){
        super();
        this.closure=closure;
        this.waited=0;
    }

    drive(vehicle,world){
        const distance=vehicle.y-vehicle.height/2-this.closure.y;
        if(vehicle.lane!=this.closure.closedLane || distance<0){
            vehicle.intent=null;
            return this.follow(vehicle,world,vehicle.cruiseSpeed);
        }

        vehicle.intent="MERGE";
        if(distance<Settings.zipper.terminalDistance){
            this.waited++;
            const open=this.closure.closedLane<world.road.laneCount-1
                ?this.closure.closedLane+1
                :this.closure.closedLane-1;
            if(this.waited>60 && world.isGapFree(vehicle,open,25,45)){
                vehicle.lane=open;
            }
        }
        return Math.min(
            this.follow(vehicle,world,vehicle.cruiseSpeed),
            Math.max(0,(distance-10)/30)
        );
    }
}

class LaneClosureScenario extends Scenario{
    static title="Lane closure";
    static length=2400;

    static isApplicable(profile){
        return Settings.laneCount>1;
    }

    static spawn(traffic,originY,focusY){
        const closure=traffic.addFeature(
            new ClosureFeature(traffic.road,0,originY-400)
        );
        traffic.spawn(0,originY,1.4,new ZipperTechnique(closure));
        for(let y=focusY-260;y>closure.y+100;y-=190){
            traffic.spawn(1,y,1);
        }
    }
}

ScenarioDirector.register(LaneClosureScenario);
