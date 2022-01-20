export class Helper {
    static removeoccurences(array, word){
        for(let i = 0; i < array.length; i++) {
            if(array[i] == word) {
                array.splice(i, 1);
                i--;
            }
        }
    }

    static indexwords(str){
        let tab = str.toLowerCase().split(/[^a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ]/)
        this.removeoccurences(tab, '');
        return tab
    }

    static countWord(word, wordTab) {
        if (word != '') {
            let count = 0;
            for (let i = 0; i < wordTab.length; i++) {
                if (wordTab[i].toLowerCase() == word.toLowerCase()) {
                    count++;
                }
            }
            return count
        }
        return
    }
}