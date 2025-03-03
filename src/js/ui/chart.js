// Best and average fitness per finished generation
class FitnessChart{
    // Left is the least room for the labels of the value axis
    static #padding={left:44,right:12,top:12,bottom:24};

    static draw(){
        const canvas=document.getElementById("fitnessChart");
        const entries=GenerationHistory.entries;
        const empty=entries.length==0;
        document.getElementById("fitnessEmpty").hidden=!empty;
        canvas.hidden=empty;
        if(empty){
            canvas.setAttribute(
                "aria-label",
                "Fitness chart, no generation has ended yet"
            );
            return;
        }

        const latest=GenerationHistory.latest();
        canvas.setAttribute(
            "aria-label",
            "Best fitness "+FitnessChart.#format(latest.best,1)
                +" at generation "+latest.generation
                +"; average "+FitnessChart.#format(latest.average,1)
        );

        // A canvas that was hidden has no buffer size yet
        Sizing.fitChart();
        if(canvas.width==0 || canvas.height==0){
            return;
        }

        const ctx=canvas.getContext("2d");
        const pad=FitnessChart.#padding;
        ctx.clearRect(0,0,canvas.width,canvas.height);

        let min=0;
        let max=0;
        entries.forEach(entry=>{
            min=Math.min(min,entry.best,entry.average);
            max=Math.max(max,entry.best,entry.average);
        });
        const scale=FitnessChart.#getScale(min,max);
        const ticks=[scale.min,scale.min+scale.step*2,scale.max];

        ctx.font="13px "+Theme.font;
        const labels=ticks.map(value=>FitnessChart.#format(value,scale.step));
        const widest=Math.max(...labels.map(l=>ctx.measureText(l).width));
        const left=Math.max(pad.left,Math.ceil(widest)+12);
        const right=canvas.width-pad.right;
        const top=pad.top;
        const bottom=canvas.height-pad.bottom;
        const yOf=value=>lerp(
            bottom,top,(value-scale.min)/(scale.max-scale.min)
        );
        const xOf=index=>entries.length==1
            ?(left+right)/2
            :lerp(left,right,index/(entries.length-1));

        ctx.fillStyle=Theme.chartAxis;
        ctx.textAlign="left";
        ctx.textBaseline="middle";
        ticks.forEach((value,i)=>{
            ctx.fillText(labels[i],0,yOf(value));
        });

        ctx.textBaseline="top";
        const every=Math.ceil(entries.length/6);
        for(let i=0;i<entries.length;i+=every){
            const label=String(entries[i].generation);
            const x=xOf(i);
            const half=ctx.measureText(label).width/2;
            ctx.textAlign=x+half>canvas.width?"right":"center";
            ctx.fillText(
                label,
                ctx.textAlign=="right"?canvas.width:x,
                bottom+6
            );
        }

        ctx.lineJoin="round";
        ctx.lineWidth=2;
        FitnessChart.#drawLine(
            ctx,entries,"average",xOf,yOf,Theme.chartAverage
        );
        ctx.lineWidth=3;
        FitnessChart.#drawLine(
            ctx,entries,"best",xOf,yOf,Theme.chartBest
        );
    }

    static #drawLine(ctx,entries,key,xOf,yOf,color){
        ctx.strokeStyle=color;
        ctx.beginPath();
        entries.forEach((entry,i)=>{
            ctx.lineTo(xOf(i),yOf(entry[key]));
        });
        ctx.stroke();

        const last=entries.length-1;
        ctx.beginPath();
        ctx.arc(xOf(last),yOf(entries[last][key]),4,0,Math.PI*2);
        ctx.fillStyle=color;
        ctx.fill();
    }

    // Four steps of a round size, from 0 (or below it for negatives)
    static #getScale(min,max){
        const raw=(max-min)/4||1;
        const base=Math.pow(10,Math.floor(Math.log10(raw))-1);
        const factors=[1,2,2.5,5,10,20,25,50,100,200,250,500,1000];
        let step=0;
        let low=0;
        for(let i=0;i<factors.length;i++){
            step=factors[i]*base;
            low=Math.floor(min/step)*step;
            if(low+step*4>=max){
                break;
            }
        }
        return {min:low,max:low+step*4,step:step};
    }

    static #format(value,step){
        const digits=step>=1?(step%1==0?0:1):2;
        return value.toLocaleString("en-US",{
            minimumFractionDigits:digits,
            maximumFractionDigits:digits
        });
    }
}
