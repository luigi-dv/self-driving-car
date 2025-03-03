class Road{
    constructor(x,width,laneCount=3){
        this.x=x;
        this.width=width;
        this.laneCount=laneCount;
        this.laneWidth=width/laneCount;
        this.handedness="RHT";

        this.left=x-width/2;
        this.right=x+width/2;

        const infinity=1000000;
        this.top=-infinity;
        this.bottom=infinity;

        const topLeft={x:this.left,y:this.top};
        const topRight={x:this.right,y:this.top};
        const bottomLeft={x:this.left,y:this.bottom};
        const bottomRight={x:this.right,y:this.bottom};
        this.borders=[
            [topLeft,bottomLeft],
            [topRight,bottomRight]
        ];
    }

    getLaneCenter(laneIndex){
        const laneWidth=this.width/this.laneCount;
        return this.left+laneWidth/2+
            Math.min(laneIndex,this.laneCount-1)*laneWidth;
    }

    // Policy lanes: lane 0 is the outermost slow lane, whatever the
    // side of the road the traffic drives on
    laneToX(lane){
        const index=this.handedness=="RHT"
            ?this.laneCount-1-lane
            :lane;
        return this.left+this.laneWidth*(index+0.5);
    }

    xToLanePosition(x){
        const index=(x-this.left)/this.laneWidth-0.5;
        return this.handedness=="RHT"
            ?this.laneCount-1-index
            :index;
    }

    xToLane(x){
        return Math.round(this.xToLanePosition(x));
    }

    draw(ctx){
        ctx.fillStyle=Theme.road;
        ctx.fillRect(this.left,this.top,this.right-this.left,this.bottom-this.top);

        ctx.lineWidth=Theme.lineWidth;
        ctx.strokeStyle=Theme.laneMark;

        for(let i=1;i<=this.laneCount-1;i++){
            const x=lerp(
                this.left,
                this.right,
                i/this.laneCount
            );

            ctx.setLineDash([20,20]);
            ctx.beginPath();
            ctx.moveTo(x,this.top);
            ctx.lineTo(x,this.bottom);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        ctx.strokeStyle=Theme.roadEdge;
        this.borders.forEach(border=>{
            ctx.beginPath();
            ctx.moveTo(border[0].x,border[0].y);
            ctx.lineTo(border[1].x,border[1].y);
            ctx.stroke();
        });
    }
}