// Best and average fitness of every finished generation, for the chart
class GenerationHistory{
    static #entries=[];

    static push(entry){
        GenerationHistory.#entries.push(entry);
    }

    static clear(){
        GenerationHistory.#entries=[];
    }

    static get entries(){
        return GenerationHistory.#entries;
    }

    static latest(){
        const entries=GenerationHistory.#entries;
        return entries[entries.length-1]||null;
    }
}
