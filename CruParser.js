var UE = require('./UE');


// CruParser

var CruParser = function(sTokenize, sParsedSymb){
	// The list of UE parsed from the input file.
	this.parsedUE = [];
	this.symb = ["+","code","créneau"];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
CruParser.prototype.tokenize = function(data){
	var separator = /(\r\n|: )/;
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
		//console.log("Reckognized! "+s)
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}


// Parser rules

// <liste_ue> = *(<ue>)
CruParser.prototype.listUE = function(input){
	this.ue(input);
}

// <poi> = "START_POI" <eol> <body> "END_POI"
// UE = "+" <body>
CruParser.prototype.ue = function(input){

	if(this.check("+", input)){
		this.expect("+", input);
		var args = this.body(input);
		var ue = new UE(args.code, []);
		this.creneaux(input, ue);
		this.parsedUE.push(p);
		if(input.length > 0){
			this.ue(input);
		}
		return true;
	}else{
		return false;
	}

}

// <body> = <name> <eol> <latlng> <eol> <optional>
VpfParser.prototype.body = function(input){
	var code = this.code(input);
	return { code: code};
}

// <name> = "name: " 1*WCHAR
// code = 2ALPHA 2DIGIT CRLF
VpfParser.prototype.code = function(input){
	var curS = this.next(input);
	if(matched = curS.match(/[A-Z][A-Z]\d\d/)){
		return matched[0];
	}else{
		this.errMsg("Invalid code", input);
	}
}

// <optional> = *(<note>)
// <note> = "note: " "0"/"1"/"2"/"3"/"4"/"5"
VpfParser.prototype.creneaux = function (input, curUE){
	this.expect("note", input);
	var curS = this.next(input);
	if(matched = curS.match(/[12345]/)){
		curPoi.addRating(matched[0]);
		if(input.length > 0){
			this.note(input, curPoi);
		}
	}else{
		this.errMsg("Invalid note");
	}	
}

module.exports = VpfParser;