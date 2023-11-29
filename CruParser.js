var UE = require('./UE');
var Creneau = require('./Creneau');


// CruParser

var CruParser = function(sTokenize, sParsedSymb){
	// The list of UE parsed from the input file.
	this.parsedUE = [];
	this.symb = ["+","code","créneau",""];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
CruParser.prototype.tokenize = function(data){
	var separator = /(\+|\r\n|\s|,P=|,S=|,H=|,|\/\/\r\n|\r\+|\/\/)/;
	data = data.split(separator);
	data = data.filter((val, idx) => !val.match(separator)); 					
	return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
CruParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	if(this.showTokenize){
		console.log(tData);
	}
	this.listUE(tData);
}

// Parser operand

CruParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
CruParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS
}

// accept : verify if the arg s is part of the language symbols.
CruParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}

	return idx;
}



// check : check whether the arg elt is on the head of the list
CruParser.prototype.check = function(s, input){
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
CruParser.prototype.expect = function(s, input){
	if(s == this.next(input)){
		console.log("Reckognized! "+s)
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}


// Parser rules

// <liste_ue> = *(<ue>)
CruParser.prototype.listUE = function(input){
	console.log(input);
	this.ue(input);
}


// UE = "+" <body>
CruParser.prototype.ue = function(input){

	//if(this.check("+", input)){
		this.expect("", input);
		var args = this.code(input);
		var ue = new UE(args, []);
		while (input[0]!==""){
			var cren = this.creneaux(input, ue);
		}
		this.parsedUE.push(ue);
		if(input.length > 1){
			this.ue(input);
		}
		return true;
	//}else{
		//return false;
	//}
}


// code = 2ALPHA 2DIGIT CRLF
CruParser.prototype.code = function(input){
	var curS = this.next(input);
	if(matched = curS.match(/[A-Z]{1,4}\d{0,3}/)){
		return matched[0];
	}else{
		this.errMsg("Invalid code", input);
		return 0;
	}
}



//creneau = “1” “,” type “,”nbplaces“,” jour “,” horaire “,” groupe_cours “,” salle “//” CRLF
CruParser.prototype.creneaux = function (input, curUE){
	
	var ty = this.type(input);
	var nbP = this.nbplaces(input);
	var j = this.jour(input);
	var h = this.horaire(input);
	var gC = this.groupe_cours(input);
	var s = this.salle(input);
	
	var creneau = new Creneau(ty, nbP, j, h, gC, s);
	curUE.addCreneau(creneau);

}


// type = (“C”/”D”/”T’) 1DIGIT
CruParser.prototype.type = function(input){
	var curS = this.next(input);
	var curS = this.next(input);
	console.log("curS=" + curS);
	if(matched = curS.match(/[CDT]\d/)){
		return matched[0];
	}else{
		this.errMsg("Invalid type", input);
	}
}

// nbplaces = “P=” 2*3DIGIT
CruParser.prototype.nbplaces = function(input){
	var curS = this.next(input);
	console.log("curS=" + curS);
	if(matched = curS.match(/\d{1,3}/)){
		return matched[0];
	}else{
		this.errMsg("Invalid nombre de place", input);
	}
}

// jour = “H=” (“L”/”MA”/”ME”/”J”/”V”/”S”) WSP
CruParser.prototype.jour = function(input){
	var curS = this.next(input);
	console.log("curS=" + curS);
	if(matched = curS.match(/(L|MA|ME|J|V|S)/)){
		return matched[0];
	}else{
		this.errMsg("Invalid jour", input);
	}
}

// horaire = 1*2DIGIT “:” 2DIGIT “-” 1*2DIGIT “:” 2DIGIT
CruParser.prototype.horaire = function(input){
	var curS = this.next(input);
	console.log("curS=" + curS);
	if(matched = curS.match(/\d{1,2}:\d{2}-\d{1,2}:\d{2}/)){
		return matched[0];
	}else{
		this.errMsg("Invalid horaire", input);
	}
}

// groupe_cours = “F” 1DIGIT
CruParser.prototype.groupe_cours = function(input){
	var curS = this.next(input);
	console.log("curS=" + curS);
	if(matched = curS.match(/F\d|[A-Z]{1,2}/)){
		return matched[0];
	}else{
		this.errMsg("Invalid groupe_cours", input);
	}
}

// salle = “S= (1ALPHA 3DIGIT)/(%s”EXT” 1DIGIT)
CruParser.prototype.salle = function(input){
	var curS = this.next(input);
	matched = curS.match(/([A-Za-z]\d{3}|EXT\d)/)
	console.log("curS=" + curS);
	if(matched != null){
		return matched[0];
	}else{
		this.errMsg("Invalid salle", input);
	}
	var curS = this.next(input);
}

module.exports = CruParser;