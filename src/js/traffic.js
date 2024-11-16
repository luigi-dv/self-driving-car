class Traffic{
    constructor(road,rowSpacing=200,speed=2){
        this.road=road;
        this.rowSpacing=rowSpacing;
        this.speed=speed;
        this.lookAhead=1000;
        this.lookBehind=600;

        this.cars=[];
        this.leader=null;
    }

    update(roadBorders,focusY){
        while(this.#getNextRowY()>focusY-this.lookAhead){
            this.#addRow(this.#getNextRowY());
        }
        for(let i=0;i<this.cars.length;i++){
            this.cars[i].update(roadBorders,[]);
        }
        this.cars=this.cars.filter(
            c=>c.y<focusY+this.lookBehind
        );
    }

    #getNextRowY(){
        return this.leader
            ?this.leader.y-this.rowSpacing
            :-100;
    }

    #addRow(y){
        const lanes=[];
        for(let i=0;i<this.road.laneCount;i++){
            lanes.push(i);
        }

        const blocked=Math.max(1,
            Math.ceil(Math.random()*(this.road.laneCount-1))
        );
        for(let i=0;i<blocked;i++){
            const index=Math.floor(Math.random()*lanes.length);
            const lane=lanes.splice(index,1)[0];
            const car=new Car(
                this.road.getLaneCenter(lane),
                y,30,50,"DUMMY",this.speed,getRandomColor()
            );
            this.cars.push(car);
            this.leader=car;
        }
    }

    draw(ctx){
        for(let i=0;i<this.cars.length;i++){
            this.cars[i].draw(ctx);
        }
    }
}
