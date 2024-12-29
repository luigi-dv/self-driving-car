class Yaml{
    static parse(text){
        const root={};
        const stack=[{indent:-1,value:root}];
        const lines=text.split(/\r?\n/);

        for(let i=0;i<lines.length;i++){
            const line=lines[i].replace(/\s+#.*$/,"");
            if(line.trim()=="" || line.trim().startsWith("#")){
                continue;
            }

            const indent=line.search(/\S/);
            const separator=line.indexOf(":");
            if(separator<0){
                throw new Error("Yaml: unsupported line "+(i+1));
            }
            const key=line.slice(indent,separator).trim();
            const rest=line.slice(separator+1).trim();

            while(stack[stack.length-1].indent>=indent){
                stack.pop();
            }
            const parent=stack[stack.length-1].value;
            if(rest==""){
                parent[key]={};
                stack.push({indent:indent,value:parent[key]});
            }else{
                parent[key]=Yaml.#parseValue(rest);
            }
        }

        return root;
    }

    static #parseValue(text){
        if(text.startsWith("[") && text.endsWith("]")){
            const inner=text.slice(1,-1).trim();
            return inner==""
                ?[]
                :inner.split(",").map(e=>Yaml.#parseValue(e.trim()));
        }
        if(/^".*"$/.test(text) || /^'.*'$/.test(text)){
            return text.slice(1,-1);
        }
        if(text=="true"){
            return true;
        }
        if(text=="false"){
            return false;
        }
        if(text=="null" || text=="~"){
            return null;
        }
        return isNaN(Number(text))?text:Number(text);
    }
}
