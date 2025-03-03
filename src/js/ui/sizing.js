// Canvas buffers follow the size of their element, and only when that
// size changes: resizing a canvas clears it
class Sizing{
    // The road is always drawn 340 wide, its x positions depend on it; the
    // element is as wide as its well and scales the drawing
    static roadWidth=340;

    static init(){
        Sizing.apply();
        const observer=new ResizeObserver(()=>Sizing.apply());
        ["myCanvas","networkCanvas","fitnessChart"].forEach(id=>{
            observer.observe(document.getElementById(id));
        });
    }

    static apply(){
        Sizing.#fitRoad();
        Sizing.fit(document.getElementById("networkCanvas"));
        if(Sizing.fitChart()){
            FitnessChart.draw();
        }
    }

    // Returns true when the buffer of the chart changed
    static fitChart(){
        return Sizing.fit(document.getElementById("fitnessChart"));
    }

    static fit(canvas){
        const width=canvas.clientWidth;
        const height=canvas.clientHeight;
        if(width==0 || height==0
            || (canvas.width==width && canvas.height==height)){
            return false;
        }
        canvas.width=width;
        canvas.height=height;
        return true;
    }

    static #fitRoad(){
        const canvas=document.getElementById("myCanvas");
        if(canvas.width!=Sizing.roadWidth){
            canvas.width=Sizing.roadWidth;
        }
        if(canvas.clientWidth==0 || canvas.clientHeight==0){
            return;
        }
        const height=Math.round(
            canvas.clientHeight*Sizing.roadWidth/canvas.clientWidth
        );
        if(canvas.height!=height){
            canvas.height=height;
        }
    }
}
