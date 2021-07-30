/*
 * Copyright (c) 2014 Judah Ajayi and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 *
 * This file is available and licensed under the following license:
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *  - Redistributions must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  - Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in
 *    the documentation and/or other materials provided with the distribution. 
 *
 * THIS LANGUAGE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
 *Author Judah Ajayi
 */

var loaded = false; 
document.onreadystatechange = function(){  
	if(!loaded){  
		load();
		loaded = true;
	}
}

function load(){ 
	var generatedScript = "",
	headTag = document.getElementsByTagName("head")[0], 
	scriptText = getInnerIcsScript(), 
	icScript = document.createElement("script"); 
	icScript.setAttribute("id","ics");
	icScript.setAttribute("type","text/javascript") 
	generatedScript = processScript(scriptText);   
	icScript.innerHTML+= "\n"+generatedScript 
	headTag.appendChild(icScript) 
	//alert(generatedScript);
}

/**
* This method automatically retrieves the ics script from an
* HTML document
*/
function getInnerIcsScript(){  
	var result = "";
	var icsNode = NodeOperator.nodeAtrributeAndValue("type","text/ics")
	for(var count = 0; count < icsNode.length; count++){
		var skip = false, externalFile
		for(var icount = 0; icount < icsNode[count].attributes.length; icount++){
			if(icsNode[count].attributes[icount].nodeName == "ref"){
				skip = true
				var refFile = icsNode[count].attributes[icount]
				break
			}
		}
		if(skip){
			
		}else{
			result+= icsNode[count].innerHTML 
		}
	} 
	return result
}

 

/****************************************************************************************************************************
*****************************************************************************************************************************
*           //////////////////////////////////////////////////////////////////////////////////////////////                  *
*          //                                                                                          //                   *
*         //     //////////   ///////////   ///////   //   ///////////   //////////   ///////////     //                    *
*        //             //   //       //   //   //   //   //            //           //       //     //                     *
*       //         //  //   ///////////   //   //   //   //  ///////   //////////   ///////////     //                      *
*      //             //   //       //   //   //   //   //       //   //           //     //       //                       *
*     //      /////////   //       //   //   ///////   ///////////   ///////////  //      //      //                        *
*    //                                                                                          //                         *
*   //////////////////////////////////////////////////////////////////////////////////////////////                          *
*****************************************************************************************************************************
*****************************************************************************************************************************
*/


/**
*
* This method interpretes the ics script and rewrites it into javascript
* @param string 
*/
function processScript(text){ 
	assignIcsid()
	var codeLines = splitToCodeLines(text), 
	result = CodeInterpreter.interprete("ics",codeLines); 
	return result
}

function assignIcsid(){
	var elements = document.getElementsByTagName("*")
	for(var count = 0; count < elements.length; count++){
		elements[count].icsid = "element"+count
	}
}

 

/**
* This method processes the passed script string by splitting
* it to an <b>array of ics code lines</b>
* @param text
*/
function splitToCodeLines(text){
	var chr = stringToArray(text);
	var newString = "";
	var result;
	for(var count = 0; count < chr.length; count++){
		
		if(chr[count] == "{" || chr[count] == "}"){ 
			newString+= ";"+chr[count]+";";
		}else{
			newString+= chr[count]
		}
	}
	result = keywords(newString,";","") //codeSpliterKeyWords(newString,";","",false,"(:)") //keywords(newString,";","") 
	return result;
}

function icsFunctions(funcName,element){
	CodeInterpreter.functions[funcName](element)
}

var CodeInterpreter = {
	outputScript: "",
	functionNames: {},
	functionLoopControler: {},
	functionSelectors: {},
	functionNameId: 0,
	functionEvents: {},
	functions:{}, 
	interprete: function(parentName,text){
		
		var events,
			event,
			eventIsParent = false,
			eventsCounter = 0,
			bracketCounter = 0,
			styleCounter = 0,
			jscriptCounter = 0, 
			jscriptInnerCounter = 0,
			bracketType = [], 
			selectorFound = false,
			hoverOutStyleList = "",
			preserveAnimation = "",
			styleList = "",
			preStyleList = "",
			attributeList = "",
			animTimer = 0,
			hoverOutAnimTimer = 0,
			functionBody = "",
			callBackFunction = "",
			tab = "",
			functionName = undefined,
			outputCode = ""
			
		function reset(){
			event = undefined
			eventIsParent = false
			events = undefined
			eventsCounter = 0
			bracketCounter = 0
			styleCounter = 0
			jscriptCounter = 0 
			jscriptInnerCounter = 0
			bracketType = []
			selectorFound = false
			hoverOutStyleList = ""
			preserveAnimation = ""
			styleList = ""
			preStyleList = ""
			attributeList = ""
			animTimer = 0
			hoverOutAnimTimer = 0
			functionName = undefined
			callBackFunction = ""
			functionBody = ""
			tab = ""
			
		}
		function processAttributes(functionName){
			var result = "",
				event = events != undefined?events[eventsCounter]:undefined;
			if(attributeList.length > 0){
				var attribs = attributeList.split(";"), 
					selectors = CodeInterpreter.functionSelectors[functionName],
					iscript = ""
				if(event == "-"){
					for(var count = 0; count < selectors.length; count++){
						for(var icount = 0; icount < attribs.length; icount++){
							var attrib = attribs[icount]
							if(attrib != ""){
								iscript+= "\n\tCodeInterpreter.functionSelectors[\""+functionName+"\"]["+count+"]."+attrib+"\n"
							}
						}
					}
				}else if(event != undefined){
					for(var count = 0; count < attribs.length; count++){
						var attrib = attribs[count]
						if(attrib != ""){
							iscript+= "\n\tcurrentElement."+attrib+"\n"
						}
					}
				} 
				result = iscript
			}
			attributeList = ""
			return result
		}
		function addStyles(functionName){
			var result = "",
			    actionText = "\t\tAnimation.stop(currentElement);\n"
							 +"\t\tvar lastStyleUsed = styleProps[currentElement.icsid+\"lastStyle\"] == undefined?\"\":styleProps[currentElement.icsid+\"lastStyle\"],\n"
							 +"\t\t styleVar = StyleManager.removeDualStyles(lastStyleUsed,\""+styleList+"\"),\n"
							 +"\t\t preStyleVar = \""+preStyleList+"\",\n" 
							 +"\t\tcallerFunc = \""+functionName+"\",\n" 
							 if(animTimer == 0){
								actionText+= "\tstyleOutput = StyleManager.fixStyleVariables(currentElement,styleVar);\n"
								+"\tStyleManager.loadPreStyles(callerFunc,currentElement,preStyleVar);\n"
								+"\t currentElement.setAttribute(\"style\",styleOutput);\n"
							 }else{
								var  funcNameWithoutDot = keywords(functionName,".","",true)
								actionText+= "\t\t animTime = "+animTimer+",\n"
										+"\t\t"+funcNameWithoutDot+"_animFunc = {\n"
										+"\t\t\tcall: function(){\n"
										+"\t\t\t\t"+callBackFunction+"\n"
										+"\t\t\t}\n"
										+"\t\t};\n"
										+"\tStyleManager.loadPreStyles(callerFunc,currentElement,preStyleVar);\n"
										+"\tAnimation.animate(callerFunc,currentElement,styleVar,animTime,"+funcNameWithoutDot+"_animFunc);\n" 
							 } 
							 actionText+= "\t\tstyleProps[currentElement.icsid+\"lastStyle\"] = styleVar\n"
			var	event = events != undefined?events[eventsCounter]:undefined;
			if(event == "-"){
				var elements = CodeInterpreter.functionSelectors[functionName]
				for(var count = 0; count < elements.length; count++){  
					result+= "\n\tvar currentElement = CodeInterpreter.functionSelectors[\""+functionName+"\"]["+count+"];\n"
							 +actionText
									
				}
			}else{
				result = actionText	 
			} 
			
			return result
		}
		
		function addHoverOutScript(functionName){
			var result = 		"\n\tCodeInterpreter.functions[\""+functionName+"hoverout\"] = function(args){\n"
								+"\t\tvar currentElement = args, \n"
								+"\t\tlastStyleUsed = styleProps[currentElement.icsid+\"lastStyle\"] == undefined?\"\":styleProps[currentElement.icsid+\"lastStyle\"];\n"
								+"\t\t var \tpreStyleVar = \""+hoverOutStyleList+"\",\n" 
								+"\t\telemName = currentElement.icsid,\n"
								+"\t\tcallerFunc = \""+functionName+"\";\n" 
								+"\t\tif(Animation.intervalVars[elemName] != undefined){\n"
								+"\t\t\twindow.clearInterval(Animation.intervalVars[elemName])\n"
								+"\t\t\twindow.clearTimeout(Animation.timeoutVars[elemName]) \n"
								+"\t\t}\n"
								+"\t\tvar styleVar = StyleManager.removeDualStyles(lastStyleUsed,StyleManager.getPreStyles(currentElement,preStyleVar)),\n"
								if(hoverOutAnimTimer == 0){
									result+= "\t\t styleOutput = StyleManager.fixStyleVariables(currentElement,styleVar);\n"
									+"\t\tcurrentElement.setAttribute(\"style\",\"\"+styleOutput+\"\");\n" 
								}else{
									result+= "\t\tanimTime = \""+hoverOutAnimTimer+"\";\n"
											+"\tAnimation.animate(callerFunc,currentElement,styleVar,animTime);\n"
								}
								result+= "\t\tstyleProps[currentElement.icsid+\"lastStyle\"] = styleVar\n" 
								+"\t}\n"
			hoverOutStyleList = ""
			hoverOutAnimTimer = 0
			preserveAnimation = ""
			return result
		}
		for(var count = 0; count < text.length; count++){ 
			var line = text[count].trim()
				if(functionName == undefined){
					functionName = parentName+".func"+CodeInterpreter.functionNameId 
				}
			CodeInterpreter.functionLoopControler[functionName] = count
			CodeInterpreter.functionLoopControler[parentName]+= parentName != "ics"?1:""
			
			if(stringContains(line,"//")){
				var temp = keywords(line,"//","")
				line = temp[0]
			}
			if(SelectorOperator.isSelector(line)){
				if(bracketCounter == 0){ 
					CodeInterpreter.functionSelectors[functionName] = SelectorOperator.processSelectors(line,functionName)
					events = CodeInterpreter.functionEvents[functionName] 
					event = events[eventsCounter]
					CodeInterpreter.functionNameId++
					bracketType[bracketCounter] = "selector" 
					selectorFound = true  
					eventIsParent = events.length == 1  
				}else{
					outputCode+= CodeInterpreter.interprete(functionName,text.slice(count,text.length))
					count = CodeInterpreter.functionLoopControler[functionName] - 1 
				}
				
			}else if(stringStartsWith(line,"style")){ 
				bracketType[bracketCounter] = "style" 
				
			}else if(stringStartsWith(line,"jscript")){ 
				bracketType[bracketCounter] = "jscript" 
				
			}else if(event != undefined && (stringStartsWith(line,event) || stringStartsWith(line,""+eventsCounter+""))){
				event = events[eventsCounter]
				outputCode+= event == "-"?"":"\n"+tab+"CodeInterpreter.functions[\""+functionName+""+event+"\"] = function(args)"
				bracketType[bracketCounter] = event
			}else if(line == "{"){
				
				if(event != undefined && bracketType[bracketCounter] == event){  
					outputCode+= "{\n"  
					if(event != "-"){
						outputCode+= "\t\tvar currentElement = args;\n"
					}
				}else{
					outputCode+= processAttributes(functionName) 
					if(bracketType[bracketCounter - 1] == "jscript" && jscriptInnerCounter + 1 > 0 && !(stringStartsWith(text[count -1].trim(),"#loop"))){
						outputCode+= tab+"{\n"
					}
				}  
				tab+= "\t"
				if(bracketCounter == 0 || bracketType[bracketCounter -1] != "jscript"){
					bracketCounter++
					if(eventIsParent && bracketCounter == 1){
						outputCode+= event == "-"?"\n{\n":"\n"+tab+"CodeInterpreter.functions[\""+functionName+""+event+"\"] = function(args){\n\t\tvar currentElement = args; \n"
					}
				}else if(bracketType[bracketCounter - 1] == "jscript"){
					jscriptInnerCounter++
				} 
			}else if(line == "}"){
				var tempTab = tab
				tab = tempTab.slice(0,-2)
				if(bracketType[bracketCounter - 1] == "selector"){
					if(selectorFound){ 
						outputCode+= processAttributes(functionName)
						if(eventIsParent){
							outputCode+= "\n}\n"
							if(event == "hover"){
								outputCode+= addHoverOutScript(functionName)
							}
						}
						if(parentName != "ics"){
							return outputCode
						}else{
							//alert("selector end \n\ncount is "+count+"\nbracketCounter is "+(bracketCounter - 1)+"\n"+outputCode)
							
						}
					}else{
						if(jscriptInnerCounter == 0){
								//alert("JSCRIPT end \nbracketCounter is"+(bracketCounter - 1)+"\n"+outputCode)
						}
					}
				}else if(bracketType[bracketCounter - 1] == "style"){
					outputCode+= addStyles(functionName)
					preStyleList = ""
					styleList = ""
					animTimer = 0
					callBackFunction = ""
				}else if(bracketType[bracketCounter - 1] == "jscript"){
						if(jscriptInnerCounter == 0){
							//alert("JSCRIPT end \nbracketCounter is"+(bracketCounter - 1)+"\n"+outputCode)
						}
				}else if(event != undefined && bracketType[bracketCounter - 1] == event){
					outputCode+= processAttributes(functionName)
								 +"\n"+tab+"}\n" 
					if(event == "hover"){
						outputCode+= addHoverOutScript(functionName)
					}
					if(eventsCounter+1 < events.length){
						eventsCounter++
						event = events[eventsCounter]
					}
				}
				
				if(jscriptInnerCounter > 0){
					outputCode+= "\n"+tab+"}\n"  
					jscriptInnerCounter--
				}else{
					bracketCounter--
					if(bracketCounter == 0){
						reset()
					}
				} 
			}else  if(bracketType[bracketCounter-1] == "style"){  
				if(findKeywords(line,"->")){ 
					var sAttribute = line.split("->")[0].trim(),
					sValue = line.split("->")[1].trim(),
					preStyleMode = stringStartsWith(sAttribute,"*"),
					attrib = preStyleMode?sAttribute.slice(1):sAttribute,
					value = sValue,
					outputStyle = "";
					if(attrib.slice(0,1) == "#"){
						if(attrib.slice(1) == "animate"){
							if(stringContains(value,",")){
								var timer = value.split(",")[0].trim(),
									callBackFunc = value.split(",")[1].trim()
								animTimer = parseInt(timer.slice(0,timer.indexOf("s")))
								callBackFunction = callBackFunc
							}else{
								animTimer = parseInt(value.slice(0,value.indexOf("s")))
							}
							if(preserveAnimation == "preserve"){
								hoverOutAnimTimer = animTimer 
							}
						}else if(attrib.slice(1) == "preserve" && value == "animation"){
							preserveAnimation = "preserve"
							hoverOutAnimTimer = animTimer
						}else{
							var vendorPrefix = attrib.slice(1)+":"+value+";" 
										+"-moz-"+attrib.slice(1)+":"+value+";" 
										+"-webkit-"+attrib.slice(1)+":"+value+";"
										+"-o-"+attrib.slice(1)+":"+value+";" 
							outputStyle+= vendorPrefix
						} 
					}else{
						if(sValue.slice(0,1) == "#"){
							var vendorPrefix = attrib+":"+sValue.slice(1)+";"
											  +attrib+":-moz-"+sValue.slice(1)+";"
											  +attrib+":-webkit-"+sValue.slice(1)+";"
											  +attrib+":-0-"+sValue.slice(1)+";"
							outputStyle+= vendorPrefix
						}else{
							outputStyle+= attrib+":"+sValue+";" 
						}
					}
					if(preStyleMode){
						preStyleList+= outputStyle
					}else{
						styleList+= outputStyle
					}
					if(event == "hover"){
						hoverOutStyleList = preStyleList
					}
				} 
			}else if(bracketType[bracketCounter-1] == "jscript"){
				var expanded = expandCode(line,functionName,event),
					demacator = count + 1 < text.length?
					text[count + 1].trim() == "{"?"\n":";\n"
					:";\n"; 
				outputCode+= expanded.trim() == ""?expanded:expanded+demacator
			}else if(bracketType[bracketCounter-1] == "selector" || bracketType[bracketCounter-1] == event){
				if(line.split("->").length > 1){
					var sAttribute = line.split("->")[0],
					sValue = line.split("->")[1] 
					attributeList+= sAttribute+"=\""+sValue+"\";"
				}
			}
		}
		return outputCode
	}
}


var icsNamerCounter = 0,   
	icsidList = [],
	icsidListCounter = 0,     
	styleProps = {},
	stylePropsNumValues = [],
	stylePropsNumValuesCounter = 0,
	loopVarList = new Array(),
	loopVarListCounter = 0;

function expandCode(code,functionName,event){
	var result = ""
	if(findKeywords(code,"#this")){
		var selectors = CodeInterpreter.functionSelectors[functionName]
		var iscript = ""
		if(event == "-"){
			for(var count = 0; count < selectors.length; count++){ 
				iscript += keywords(code,"#this","CodeInterpreter.functionSelectors[\""+functionName+"\"]["+count+"]")+"\n"
			}
		}else if(event != undefined){
			for(var icount = 0; icount < attribs.length; icount++){
				var attrib = attribs[icount] 
				iscript += keywords(code,"#this","currentElement") 
			}
		}
		result = expandCode(iscript,functionName,event)
	}else if(findKeywords(code,"#_")){
		result = expandCode(keywords(code,"#_","")+"",functionName,event);
	}else if(findKeywords(code,"#meth")){
		result = expandCode(keywords(code,"#meth","function")+"",functionName,event);
	}else if(findKeywords(code,"#id")){
		result = expandCode(keywords(code,"#id","document.getElementById")+"",functionName,event);
	}else if(findKeywords(code,"#class")){
		result = expandCode(keywords(code,"#class","document.getElementsByClassName")+"",functionName,event);
	}else if(findKeywords(code,"#tag")){
		result = expandCode(keywords(code,"#tag","document.getElementsByTagName")+"",functionName,event);
	}else if(findKeywords(code,"#D")){
		result = expandCode(keywords(code,"#D","document")+"",functionName,event);
	}else if(findKeywords(code,"#makeElement")){
		result = expandCode(keywords(code,"#makeElement","document.createElement")+"",functionName,event);
	}else if(findKeywords(code,"#sel")){
		result = expandCode(keywords(code,"#sel","document.querySelectorAll")+"",functionName,event);
	}else if(findKeywords(code,".sel")){
		result = expandCode(keywords(code,".sel",".querySelectorAll")+"",functionName,event);
	}else if(findKeywords(code,"->") ){ 
		var toVarDeclarations = keywords(code,"#","var") 
		result = expandCode(keywords(toVarDeclarations,"->","="),functionName,event)
	}else if(code == "first"){
		result = "if(firstExp)"
	}else if(code == "last"){
		result = "if(lastExp)" 
	}else if(findKeywords(code,"#loopTo")){
		result = ""
		var oBIndex = code.indexOf("(") + 1, cBIndex = code.lastIndexOf(")"); 
		loopVarList[loopVarListCounter] = "loopVar"+loopVarListCounter
		var loopVarName = loopVarList[loopVarListCounter]
		loopVarListCounter++
		var hasBoolean = code.substring(oBIndex,cBIndex).search(">>") != -1 ||
		                     code.substring(oBIndex,cBIndex).search("<<") != -1,
		    num1 ,num2,booleanCode = "";
		if(hasBoolean){
			var storeCode = code,
				boolOperator = storeCode.substring(oBIndex,cBIndex).search(">>") != -1?">>":"<<", 
			    booleanExp = storeCode.substring(oBIndex,cBIndex).split(boolOperator)[1];
				
			booleanCode = boolOperator == ">>"? "if("+booleanExp+")\ncontinue;\n" :"if("+booleanExp+")\nbreak;\n" 
			code = "("+storeCode.substring(oBIndex,cBIndex).split(boolOperator)[0]+")";
			oBIndex = code.indexOf("(") + 1, cBIndex = code.lastIndexOf(")")
			
		}
		var num = code.substring(oBIndex,cBIndex)
		result+= "\nfor(var "+loopVarName+" = 0; "+loopVarName+" < "+num+"; "+loopVarName+"++){\n" 
			  + "\tvar firstExp,lastExp;\n"
			  + "\tfirstExp = "+loopVarName+" == 0;\n "
			  + "\tlastExp = "+loopVarName+" + 1 == "+num+";\n " 
		      + "\tvar counter = "+loopVarName+"\n"
			  + booleanCode
	}else if(findKeywords(code,"#loopFrom")){
		result = ""
		var oBIndex = code.indexOf("(") + 1, cBIndex = code.lastIndexOf(")"); 
		loopVarList[loopVarListCounter] = "loopVar"+loopVarListCounter
		var loopVarName = loopVarList[loopVarListCounter]
		loopVarListCounter++
		var hasBoolean = code.substring(oBIndex,cBIndex).search(">>") != -1 ||
		                     code.substring(oBIndex,cBIndex).search("<<") != -1,
		    num1 ,num2,booleanCode = "";
		if(hasBoolean){
			var storeCode = code,
				boolOperator = storeCode.substring(oBIndex,cBIndex).search(">>") != -1?">>":"<<", 
			    booleanExp = storeCode.substring(oBIndex,cBIndex).split(boolOperator)[1];
				
			booleanCode = boolOperator == ">>"? "if("+booleanExp+")\ncontinue;\n" :"if("+booleanExp+")\nbreak;\n" 
			code = "("+storeCode.substring(oBIndex,cBIndex).split(boolOperator)[0]+")";
			oBIndex = code.indexOf("(") + 1, cBIndex = code.lastIndexOf(")")
			
		}
		var num = code.substring(oBIndex,cBIndex)
		result+= "\nfor(var "+loopVarName+" = "+num+"; "+loopVarName+" > 0; "+loopVarName+"--){\n" 
			  + "\tvar firstExp,lastExp;\n"
			  + "\tfirstExp = "+loopVarName+" == "+num+";\n "
			  + "\tlastExp = "+loopVarName+" - 1 == 0;\n " 
		      + "\tvar counter = "+loopVarName+"\n"
			  + booleanCode
	}else if(findKeywords(code,"#loopThrough")){
		result = ""
		var oBIndex = code.indexOf("(") + 1, cBIndex = code.lastIndexOf(")"); 
		loopVarList[loopVarListCounter] = "loopVar"+loopVarListCounter
		var loopVarName = loopVarList[loopVarListCounter]
		loopVarListCounter++
		var hasBoolean = code.substring(oBIndex,cBIndex).search(">>") != -1 ||
		                     code.substring(oBIndex,cBIndex).search("<<") != -1,
		    num1 ,num2,booleanCode = "";
		if(hasBoolean){
			var storeCode = code,
				boolOperator = storeCode.substring(oBIndex,cBIndex).search(">>") != -1?">>":"<<", 
			    booleanExp = storeCode.substring(oBIndex,cBIndex).split(boolOperator)[1];
				
			booleanCode = boolOperator == ">>"? "if("+booleanExp+"){\ncontinue;\n}\n" :"if("+booleanExp+"){\nbreak;\n}\n" 
			code = "("+storeCode.substring(oBIndex,cBIndex).split(boolOperator)[0]+")";
			oBIndex = code.indexOf("(") + 1, cBIndex = code.lastIndexOf(")")
			
		}
		var arrayObj = code.substring(oBIndex,cBIndex).split(":")[0],
			arrayVal = code.substring(oBIndex,cBIndex).split(":")[1];
		result+= "\nfor(var "+loopVarName+" = 0; "+loopVarName+" < "+arrayObj+".length; "+loopVarName+"++){\n" 
			  + "\tvar firstExp,lastExp;\n"
			  + "\tfirstExp = "+loopVarName+" == 0;\n "
			  + "\tlastExp = "+loopVarName+" + 1 == "+arrayObj+".length;\n " 
			  + "\t"+arrayVal+" = "+arrayObj+"["+loopVarName+"]\n"
		      + "\tvar counter = "+loopVarName+"\n"
			  + booleanCode  
	}else if(findKeywords(code,"#loopRange")){
		result = ""
		var oBIndex = code.indexOf("(") + 1, cBIndex = code.lastIndexOf(")"); 
		loopVarList[loopVarListCounter] = "loopVar"+loopVarListCounter
		var loopVarName = loopVarList[loopVarListCounter]
		loopVarListCounter++
		var hasBoolean = code.substring(oBIndex,cBIndex).search(">>") != -1 ||
		                     code.substring(oBIndex,cBIndex).search("<<") != -1,
		    num1 ,num2,booleanCode = "";
		if(hasBoolean){
			var storeCode = code,
				boolOperator = storeCode.substring(oBIndex,cBIndex).search(">>") != -1?">>":"<<", 
			    booleanExp = storeCode.substring(oBIndex,cBIndex).split(boolOperator)[1];
				
			booleanCode = boolOperator == ">>"? "if("+booleanExp+")\ncontinue;\n" :"if("+booleanExp+")\nbreak;\n" 
			code = "("+storeCode.substring(oBIndex,cBIndex).split(boolOperator)[0]+")";
			oBIndex = code.indexOf("(") + 1, cBIndex = code.lastIndexOf(")")
			
		}
		num1 = code.substring(oBIndex,cBIndex).split("-")[0].trim();
		num2 = code.substring(oBIndex,cBIndex).split("-")[1].trim()
		result += "\n\tvar "+loopVarName+" = "+num1+"\n"
						+"\tvar firstExp, lastExp;\n"
						+"\tif("+num1+" < "+num2+"){\n"
						+"\t\t"+loopVarName+"--\n"
						+"\t}else\t"+"if("+num1+" > "+num2+"){\n"
						+"\t\t"+loopVarName+"++\n"
						+"\t}\n"
						+"\twhile(true){\n"
						+"\t\tif("+num1+" < "+num2+"){\n" 
						+"\t\t\t"+loopVarName+"++\n" 
						+"\t\t}else\t"+"if("+num1+" > "+num2+"){\n"
						+"\t\t\t"+loopVarName+"--\n"
						+"\t\t}\n"
						+"\t\tif("+loopVarName+" == "+num2+"){\n"
						+"\t\t\tbreak\n"
						+"\t\t}\n"
						+"\t\t\tfirstExp = "+loopVarName+" == "+num1+";\n"
						+"\t\t\tlastExp = ("+num1+" < "+num2+")?("+num1+" + 1 == "+num2+"):("+num1+" - 1 == "+num2+");\n" 
						+"\t\tvar counter = "+loopVarName+"\n"
						+booleanCode+
						+"\n"  
	}else if(findKeywords(code,">>") ){   
		if(code.indexOf("(") == -1){
			
			result = expandCode(keywords(code,">>","continue"),functionName,event);
			
		}else{
			var storeCode = code,addedQuery = "",out;
			addedQuery = storeCode.slice(storeCode.indexOf("(")+1,-1)
			result+= "if("+addedQuery+"){\ncontinue\n}"
			
		} 
	}else if(findKeywords(code,"<<") ){  
		if(code.indexOf("(") == -1){
			
			result = expandCode(keywords(code,"<<","break"),functionName,event);
			
		}else{
			var storeCode = code,addedQuery = "",out;
			addedQuery = storeCode.slice(storeCode.indexOf("(")+1,-1)
			result+= "if("+addedQuery+"){\nbreak\n}"
			
		}
		
	}else if(findKeywords(code,"<-") ){  
		
		//if(code.indexOf("[") == -1){
			
			result = expandCode(keywords(code,"<-","return"),functionName,event); 
		/*}else{
			var storeCode = code,addedQuery = "",out;
			addedQuery = storeCode.slice(storeCode.indexOf("(")+1,storeCode.indexOf("{"))
			out = expandCode(keywords(storeCode.slice(storeCode.indexOf("[")+2,storeCode.lastIndexOf("]")),"<-","return"),functionName,event);
			result+= "if("+addedQuery+"){\n"+out+"\n}"
			alert(result);
			
		}*/
	}else if(findKeywords(code,"#") ){ 
		result = keywords(code,"#","var")  
	}else{
		result = code
	} 
	return result
}



var SelectorOperator ={
	isSelector: function(text){
		 return stringStartsWith(text,"[") && stringEndsWith(text,")")
	},
	processSelectors: function(text,name){ 
		var squareBracketOIndex = text.indexOf("[") + 1, 
			squareBracketCIndex = text.lastIndexOf("]"),
			parenthesisOIndex = text.lastIndexOf("(") + 1, 
			parenthesisCIndex = text.lastIndexOf(")"),
			selectorText = text.substring(squareBracketOIndex,squareBracketCIndex),
			eventText = text.substring(parenthesisOIndex,parenthesisCIndex),
			selectors =  keywords(selectorText,",",""), 
			resultSelector = [], 
			resultSelectorCounter = 0;
		//isInnerScript = (eventText == "-");  
		function process(elements){ 
			for(var count = 0; count < elements.length; count++){
				var currentElement = elements[count];   
				attachEvent(currentElement,eventText,name) 
				//assignEvent(currentElement,eventText,name)
				resultSelector[resultSelectorCounter] = currentElement;
				resultSelectorCounter++; 
			} 
			
		}
		//alert(selectors+" "+selectors.length)
		for(var selCounter = 0; selCounter < selectors.length; selCounter++){
			var cSelector = selectors[selCounter]; 
			var elements = SelectorOperator.selectorExtractor(cSelector) 
			process(elements)
		}
		return resultSelector
		//alert(selector);
	
	},
	selectorExtractor: function(cSelector){
			var elements = [],
				verifySelector =  !findKeywords(cSelector,">") && !findKeywords(cSelector,"+")
			if(findKeywords(cSelector,"#") && elements.length == 0){
				//alert(cSelector+" is an Id selector"+" ") 
				var elementName = cSelector.trim().substring(cSelector.trim().indexOf("#")+1);
				var ownerElementText = cSelector.trim().substring(0,cSelector.trim().indexOf("#")) 
				var ownerElement = (ownerElementText.length > 0)?ownerElementText:"*";
				NodeOperator.elementName = ownerElement
				elements = NodeOperator.nodeWithId(elementName) 
			}
			if(findKeywords(cSelector,".") && elements.length == 0){
				//alert(cSelector+" is a class selector"+" ") 
				var elementName = cSelector.trim().substring(cSelector.trim().indexOf(".")+1);
				var ownerElementText = cSelector.trim().substring(0,cSelector.trim().indexOf(".")) 
				var ownerElement = (ownerElementText.length > 0)?ownerElementText:"*";
				NodeOperator.elementName = ownerElement
				elements = NodeOperator.nodeWithClass(elementName) 
			}
			if((findKeywords(cSelector,":hidden") || findKeywords(cSelector,":visible"))&& elements.length == 0){
				//alert(cSelector+" is an hidden selector"+" ") 
				var elementName = cSelector.trim().substring(cSelector.trim().indexOf(":")+1);
				var ownerElementText = cSelector.trim().substring(0,cSelector.trim().indexOf(":")) 
				var ownerElement = (ownerElementText.length > 0)?ownerElementText:"*";
				NodeOperator.elementName = ownerElement
				elements = NodeOperator.nodeVisiblityState(elementName) 
			}
			if(findKeywords(cSelector,":contains(") && elements.length == 0){
				//alert(cSelector+" is a contains selector"+" ") 
				var textToFind = cSelector.slice(cSelector.indexOf("(")+2,cSelector.lastIndexOf(")")-1)
				var elementName = cSelector.trim().substring(cSelector.trim().indexOf(":")+1);
				var ownerElementText = cSelector.trim().substring(0,cSelector.trim().indexOf(":")) 
				var ownerElement = (ownerElementText.length > 0)?ownerElementText:"*";
				NodeOperator.elementName = ownerElement
				elements = NodeOperator.nodeContainsText(textToFind) 
			}
			if(findKeywords(cSelector,":empty") && elements.length == 0){
				//alert(cSelector+" is a :empty selector"+" ")  
				var elementName = cSelector.trim().substring(cSelector.trim().indexOf(":")+1);
				var ownerElementText = cSelector.trim().substring(0,cSelector.trim().indexOf(":")) 
				var ownerElement = (ownerElementText.length > 0)?ownerElementText:"*";
				NodeOperator.elementName = ownerElement
				elements = NodeOperator.nodeIsEmpty() 
			}
			if((findKeywords(cSelector,":even") || findKeywords(cSelector,":odd")) && elements.length == 0){
				//alert(cSelector+" is a even or odd selector"+" ")  
				var splited = keywords(cSelector,":","")
				var indexType = splited.length > 2?splited[2]:splited[1];
				var elementName = splited.length > 2?splited[1]:splited[0];
				var ownerElementText = splited.length > 2?splited[0]:"";
				var ownerElement = (ownerElementText.length > 0)?ownerElementText:"*";
				NodeOperator.elementName = ownerElement 
				//alert("Owner Element: "+ownerElement+"\nElement Name: "+elementName+"\nIndex Type: "+indexType)
				elements = NodeOperator.nodeIndexEvenOrOdd(elementName,indexType) 
				//alert("I am announcing the index type elements "+elements)
			}
			if((findKeywords(cSelector,":gt") || findKeywords(cSelector,":lt") || findKeywords(cSelector,":eq")) && elements.length == 0){
				//alert(cSelector+" is an indexType selector"+" ")  
				var indexType = cSelector.trim().slice(cSelector.trim().indexOf(":")+1,cSelector.trim().indexOf("("));
				var index = cSelector.trim().slice(cSelector.trim().indexOf("(")+1,cSelector.trim().lastIndexOf(")"))
				var ownerElementText = cSelector.trim().slice(0,cSelector.trim().indexOf(":")).trim()
				var ownerElement = (ownerElementText.length > 0)?ownerElementText:"*";
				NodeOperator.elementName = ownerElement
				//alert("index Type: "+indexType+"\nindex: "+index+"\nownerElement: "+ownerElement)
				elements = NodeOperator.nodeByIndex(indexType,parseInt(index.trim()))
				//alert("I am announcing the index type elements "+elements)
			}
			if((findKeywords(cSelector,":first-child") || findKeywords(cSelector,":last-child")) && elements.length == 0){
				//alert(cSelector+" is an index First or last Child selector"+" ")  
				var indexType = cSelector.trim().slice(cSelector.trim().indexOf(":")+1);
				var ownerElementText = cSelector.trim().slice(0,cSelector.trim().indexOf(":")).trim()
				var ownerElement = (ownerElementText.length > 0)?ownerElementText:"*";
				NodeOperator.elementName = ownerElement
				elements = NodeOperator.nodeFirstLastChild(indexType)
				//alert("I am announcing the index type elements "+elements)
			}
			if(NodeOperator.inputFormat.test(cSelector.trim().substring(1).toLowerCase())&& elements.length == 0){ 
				//alert(cSelector+" is an inputFormat selector"+" ")
				var format = cSelector.trim().substring(1).toLowerCase()
				if(format == "selected"){
					NodeOperator.elementName = "option" 
					elements = NodeOperator.inputNodeWithType(cSelector.trim().substring(1).toLowerCase()) 
				}else{
					NodeOperator.elementName = "input"
					elements = NodeOperator.inputNodeWithType(cSelector.trim().substring(1).toLowerCase()) 
				}
				//alert("I am announcing the inputFormat elements "+elements+"  \nLength: "+elements.length+" \nName: "+elements[0].nodeName)
			}
			if(findKeywords(cSelector,">") && elements.length == 0){ 
				var ownerElement = keywords(cSelector,">","")[0].trim()
				var childElement = keywords(cSelector,">","")[1].trim() 
				NodeOperator.elementName = ownerElement
				elements = NodeOperator.nodeWithElement(childElement)
				//alert("I am announcing the > elements \nParent: "+parentElement+"\nChild: "+childElement+"\nElements: "+elements+" "+elements.length+" "+document.getElementsByTagName("div").length)
			}
			if(findKeywords(cSelector,"+") && elements.length == 0){  
				var ownerElement = keywords(cSelector,"+","")[0].trim()
				var childElement = keywords(cSelector,"+","")[1].trim() 
				NodeOperator.elementName = ownerElement 
				elements = NodeOperator.nodeAfterElement(childElement)
				//alert("I am announcing the + elements \nParent: "+parentElement+"\nChild: "+childElement+"\nElements: "+elements+" "+elements.length+" "+document.getElementsByTagName("div").length)
			}
			if(findKeywords(cSelector,"-") && elements.length == 0){  
				var ownerElement = keywords(cSelector,"-","")[0].trim()
				var childElement = keywords(cSelector,"-","")[1].trim() 
				NodeOperator.elementName = ownerElement 
				elements = NodeOperator.nodeBeforeElement(childElement)
				//alert("I am announcing the + elements \nParent: "+parentElement+"\nChild: "+childElement+"\nElements: "+elements+" "+elements.length+" "+document.getElementsByTagName("div").length)
			}
			if(findKeywords(cSelector,":not") && elements.length == 0){
				//alert(cSelector+" is a not selector"+" ")
				var elementName = cSelector.trim().substring(0,cSelector.trim().indexOf(":not"));
				var notList = cSelector.trim().substring(cSelector.trim().indexOf("(")+2,cSelector.trim().lastIndexOf(")") - 1)
				NodeOperator.elementName = elementName
				elements = NodeOperator.nodeNotSelectors(keywords(notList,",","")) 
				//alert("I am announcing the not elements \n"+elements+" "+elements.length+" "+document.getElementsByTagName("div").length)
				//alert(elemName+" "+notList)
			}
			if(findKeywords(cSelector,"[") && elements.length == 0){
				//alert(cSelector+" is a customized attribute selector"+" ")  
				var extracted = cSelector.slice(cSelector.indexOf("[")+1,cSelector.lastIndexOf("]")) 
				var ownerElementText = cSelector.trim().substring(0,cSelector.trim().indexOf("[")) 
				var ownerElement = (ownerElementText.length > 0)?ownerElementText:"*";
				NodeOperator.elementName = ownerElement
				if(findKeywords(extracted,"=")){
					var attr,val;
					if(findKeywords(extracted,"!=")){
						attr = keywords(extracted,"!=","")[0].trim(); val = keywords(extracted,"!=","")[1].trim();
						elements = NodeOperator.nodeAtrributeWithoutValue(attr,val.substring(1,val.length - 1));
					}else if(findKeywords(extracted,"^=")){
						attr = keywords(extracted,"^=","")[0].trim(); val = keywords(extracted,"^=","")[1].trim();
						elements = NodeOperator.nodeAtrributeValueStartsWith(attr,val.substring(1,val.length - 1)); 
					}else if(findKeywords(extracted,"$=")){
						attr = keywords(extracted,"$=","")[0].trim(); val = keywords(extracted,"$=","")[1].trim();
						elements = NodeOperator.nodeAtrributeValueEndsWith(attr,val.substring(1,val.length - 1)); 
					}else if(findKeywords(extracted,"~=")){
						attr = keywords(extracted,"~=","")[0].trim(); val = keywords(extracted,"~=","")[1].trim();
						elements = NodeOperator.nodeAtrributeValueContains(attr,val.substring(1,val.length - 1)); 
					}else{ 
						attr = keywords(extracted,"=","")[0].trim(); val = keywords(extracted,"=","")[1].trim();
						elements = NodeOperator.nodeAtrributeAndValue(attr,val.substring(1,val.length - 1)); 
					}
				}else{
					elements = NodeOperator.nodeWithAttributes(extracted.trim())
				} 
			}
			if(elements.length == 0){
				//alert(cSelector+" is an ordinary HTML tag"+" ")
				var elementName = cSelector;
				elements = document.getElementsByTagName(elementName)   
			}
			return elements
	}
	
}

Animation ={
	callFrom: "source",
	intervalVars: {}, 
	timeoutVars: {},
	lastAnimStyle: {},
	numAndTextArrayMaker: function(text,time){
		var result = [],
		count = 0,
		precount = 0,
		resultCounter = 0,
		formation = "",
		typeDecider = [],
		typeDeciderToggler = 1,
		valArray = [],
		valArrayCounter = 0,
		repeat = true;
		for(; count < text.length; count++,precount++){  
			var currentChar = text.trim().slice(precount,(count+1)) 
			if(isNaN(parseInt(currentChar))){ 
				typeDecider[typeDeciderToggler] = "let"
			}else{ 
				typeDecider[typeDeciderToggler] = "num"
			}
			if(typeDecider[0] != typeDecider[1]){ 
				result[resultCounter] = formation
				if(typeDecider[typeDeciderToggler] == "num"){
					valArray[valArrayCounter] = formation
					valArrayCounter++
				}
				formation = ""
				resultCounter++
			} 
			formation+= currentChar
			if(typeDeciderToggler >= 1){
				typeDeciderToggler = 0
			}else {
				typeDeciderToggler = 1
			} 
			if(count + 1 == text.length && repeat){
				count--
				repeat = false
			}
			if(count+ 1 == text.length && !repeat){
				if(typeDecider[typeDeciderToggler] == "let"){
					result[resultCounter++] = formation
				}
			}
		}
		return result
	},
	animate: function(callerFunc,element,args,animTime,callBackFunc){ 
		var result = "",
		elemName = element.icsid, 
		temp2 = "",
		ieBrowser = false,
		preservedTimer = animTime,
		argsSplit = args.split(";"); 
		styleProps[elemName+"->"+"Anim:"] = ""	

		if(stringContains(navigator.userAgent,"MSIE")){
			var temp = animTime
			animTime = temp/2.5
			ieBrowser
		}
		for(var count1 = 0; count1 < argsSplit.length; count1++){
			if(argsSplit[count1].split(":")[1] == undefined){
				continue
			}
			
			var sAttribute = argsSplit[count1].split(":")[0]+":",
			sValue = argsSplit[count1].split(":")[1]+";",
			temp = sAttribute,
			stylePropsNumValuesId = "",
			separated = Animation.numAndTextArrayMaker(sValue),  
			animProps = [],
			animPropsCounter = 0,
			cAttribute = styleProps[elemName+"->"+(sAttribute.slice(0,-1))+"var:"] == undefined?[]:styleProps[elemName+"->"+(sAttribute.slice(0,-1))+"var:"];
			temp2+= sAttribute
			for(var count2 = 0; count2 < separated.length; count2++){ 
				if(isNaN(parseInt(separated[count2]))){ 
						temp+= separated[count2] 
						temp2+= separated[count2]
				}else{
					if(cAttribute[animPropsCounter] == undefined){
						cAttribute[animPropsCounter] = 0;
					}
					var numValue = parseInt(separated[count2]),  
					oldNumValue = parseInt(cAttribute[animPropsCounter]),
					det = (numValue > oldNumValue)?"+":"_",
					dif = numValue > oldNumValue?numValue - oldNumValue:oldNumValue - numValue,
					seed = dif/(animTime * 100);
					temp+= numValue
					temp2+= "<"+sAttribute+"|"+seed+""+det+""+oldNumValue+">" 
					//styleProps[elemName+"->"+(sAttribute.slice(0,-1))+"var:"][animPropsCounter] = numValue
					animProps[animPropsCounter] = numValue  
					animPropsCounter++
				} 
			}
			styleProps[elemName+"->"+sAttribute.slice(0,-1)+"attrib:"] = temp
		}
		styleProps[elemName+"->"+"Anim:"] = temp2  
		var timeCount = 0;
		var lastTime = 0;
		var report = ""
		function animator(){   
			var result = "",
			editedAnimString = "", 
			animString = styleProps[elemName+"->"+"Anim:"],
			animStringSplit = animString.split(">"); 
			for(var count = 0; count < animStringSplit.length; count++){
				if(count + 1 < animStringSplit.length){
					var current = animStringSplit[count],
					intTypes = new RegExp("background|background-color|color"),
					attrib = current.slice(current.indexOf("<")+1,current.indexOf("|")),
					text = current.slice(0,current.indexOf("<")),
					det = (current.indexOf("+") != -1)?"+":"_", 
					seed = parseFloat(current.slice(current.indexOf("|")+1,current.indexOf(det))) ,
					formerNum = parseFloat(current.slice(current.indexOf(det)+1)),
					grownNum = (det == "+")? formerNum + seed :formerNum - seed;
					result+= (intTypes.test(attrib.trim()))?text+""+(parseInt(grownNum)):text+""+grownNum;
					editedAnimString+= text+"<"+attrib+"|"+seed+""+det+""+grownNum+">" 
				}else{
					result+= animStringSplit[count]
					editedAnimString+= animStringSplit[count]
				}
			} 
			styleProps[elemName+"->"+"Anim:"] = editedAnimString  
			element.setAttribute("style",result)
			StyleManager.fixStyleVariables(element,result)  
			timeCount+= 1 
			if(timeCount > (animTime * 100)){   
				StyleManager.fixStyleVariables(element,args) 
				element.setAttribute("style",args)
				Animation.stop(element) 
				callBackFunc.call()
			}
		}
		Animation.intervalVars[elemName] = setInterval(function(){
			animator();
			
		},1); 
		Animation.timeoutVars[elemName] = setTimeout(function(){
				clearInterval(Animation.intervalVars[elemName])
				element.setAttribute("style",args)
				StyleManager.fixStyleVariables(element,args) 
				callBackFunc.call()
			},(preservedTimer * 1000))
	},
	stop: function(element){
		var elemName = element.icsid
		if(Animation.intervalVars[elemName] != undefined){
			window.clearInterval(Animation.intervalVars[elemName])  
			window.clearTimeout(Animation.timeoutVars[elemName])  
		}
	}
}

var StyleManager = {
	applystyle: false,
	preStyles: {},
	fixStyleVariables: function(element,args){ 
		var elemName = element.icsid,
		argsSplit = args.split(";");
		for(var count1 = 0; count1 < argsSplit.length; count1++){
			if(argsSplit[count1].split(":")[1] == undefined){
				continue
			}
			var sAttribute = argsSplit[count1].split(":")[0]+":",
			sValue = argsSplit[count1].split(":")[1]+";",
			temp = sAttribute, 
			elemAttribCounter = 0,
			stylePropsNumValuesId = "",
			separated = Animation.numAndTextArrayMaker(sValue);  
			styleProps[elemName+"->"+(sAttribute.slice(0,-1))+"var:"] = [] 
			for(var count2 = 0; count2 < separated.length; count2++){ 
				if(isNaN(parseInt(separated[count2]))){ 
					temp+= separated[count2] 
				}else{
					var numValue = parseInt(separated[count2])   
					temp+= numValue
					styleProps[elemName+"->"+(sAttribute.slice(0,-1))+"var:"][elemAttribCounter] = numValue  
					elemAttribCounter++
				} 
			}
			styleProps[elemName+"->"+sAttribute.slice(0,-1)+"attrib:"] = temp 
		} 
		if(StyleManager.applystyle){
			element.setAttribute("style",args);
		}
		StyleManager.applystyle = false
		return args
	},
	loadPreStyles: function(funcName,element,args){ 
		var elemName = element.icsid,
		argsSplit = args.split(";");
		for(var count1 = 0; count1 < argsSplit.length; count1++){
			if(argsSplit[count1].split(":")[1] == undefined){
				continue
			}
			var sAttribute = argsSplit[count1].split(":")[0]+":",
			sValue = argsSplit[count1].split(":")[1]+";",
			temp = sAttribute, 
			elemAttribCounter = 0,
			stylePropsNumValuesId = "",
			separated = Animation.numAndTextArrayMaker(sValue); 
			if(styleProps[elemName+"->"+sAttribute.slice(0,-1)+"attrib:"] == undefined){
				if(styleProps[elemName+"->"+(sAttribute.slice(0,-1))+"var:"] == undefined){
					styleProps[elemName+"->"+(sAttribute.slice(0,-1))+"var:"] = [] 
					for(var count2 = 0; count2 < separated.length; count2 ++){ 
						if(isNaN(parseInt(separated[count2]))){ 
							temp+= separated[count2] 
						}else{
							var numValue = parseInt(separated[count2])   
							temp+= numValue
							styleProps[elemName+"->"+(sAttribute.slice(0,-1))+"var:"][elemAttribCounter] = numValue  
							elemAttribCounter++
						} 
					}
					styleProps[elemName+"->"+sAttribute.slice(0,-1)+"attrib:"] = temp  
					StyleManager.preStyles[elemName+"->"+sAttribute.slice(0,-1)+"attrib:"] = temp
				}
			}
		} 
		if(StyleManager.applystyle){
			element.setAttribute("style",args);
		}
		StyleManager.applystyle = false
		return args
	},
	getPreStyles: function(element,preStyles){
		var elemName = element.icsid,
			result = "",
			id
		for(id in StyleManager.preStyles){
			if(stringContains(id,elemName) && stringEndsWith(id,"attrib:")){
				var cAttribute = StyleManager.preStyles[id].split(":")[0]
				if(!stringContains(preStyles,cAttribute)){
					result+= StyleManager.preStyles[id]
				}
			}
		}
		return result+preStyles
	},
	removeDualStyles: function(oldStyle,newStyle){
		var result = "",
		oldStyleSplit = oldStyle.split(";"),
		newStyleSplit = newStyle.split(";") 
 		for(var count = 0; count < oldStyleSplit.length; count++){
			var oAttrib = oldStyleSplit[count].split(":")[0],
				attribFound = false
			for(var icount = 0; icount < newStyleSplit.length; icount++){
				var nAttrib = newStyleSplit[icount].split(":")[0]
				if(oAttrib == nAttrib){
					attribFound = true
					break
				} 
			}
			if(!attribFound){
				result+= oldStyleSplit[count]+";"
			}
		}
		result+= newStyle
		return result
	}
}



function attachEvent(element,event,name){
	var attribute,
		events = event.split(",")
	CodeInterpreter.functionEvents[name] = events 
	icsidList[icsidListCounter] = element
	icsidListCounter++  
	for(var count = 0; count < events.length; count++){
		var event = events[count],
			newName = name+""+event
		if(event == "hover"){ 
			var moutName = newName+"out"
			attribute = element.getAttributeNode("onmouseover")  
			if(attribute != undefined){
				attribute.nodeValue+= ",icsFunctions(\""+newName+"\",this)";  
			}else{ 
				element.setAttribute("onmouseover","icsFunctions(\""+newName+"\",this)")  
			} 
			
			attribute = element.getAttributeNode("onmouseout") 
			if(attribute != undefined){  
				attribute.nodeValue+= ",icsFunctions(\""+moutName+"\",this)"; 
			}else{ 
				element.setAttribute("onmouseout","icsFunctions(\""+moutName+"\",this)")  
			} 
		}else if(event != "-"){  
			attribute = element.getAttributeNode(event) 
			if(attribute != undefined){
				attribute.nodeValue+= ",icsFunctions(\""+newName+"\",this)"; 
			}else{ 
				element.setAttribute(event,"icsFunctions(\""+newName+"\",this)")    
			} 
		}
	}
}


function assignEvent(element,event,name){
	var attribute,
		events = event.split(",")
	CodeInterpreter.functionEvents[name] = events 
	icsidList[icsidListCounter] = element
	icsidListCounter++  
	for(var count = 0; count < events.length; count++){
		var event = events[count],
			newName = name+""+event
		if(event == "hover"){  
			var moutName = newName+"out" 
			if (element.addEventListener) {                    // For all major browsers, except IE 8 and earlier
				element.addEventListener("mouseover", function(){
					icsFunctions(newName,element);
				});
				element.addEventListener("mouseout", function(){
					icsFunctions(moutName,element);
				});
			} else if (element.attachEvent) {                  // For IE 8 and earlier versions
				element.attachEvent("onmouseover", function(){
					icsFunctions(newName,element);
				});
				element.attachEvent("onmouseout", function(){
					icsFunctions(moutName,element);
				});
			} 
		}else if(event != "-"){   
			if (element.addEventListener) {                    // For all major browsers, except IE 8 and earlier
				element.addEventListener(event.slice(2), function(){
					icsFunctions(newName,element);
				}); 
			} else if (element.attachEvent) {                  // For IE 8 and earlier versions
				element.attachEvent(event, function(){
					icsFunctions(newName,element);
				}); 
			}
		}
	}
}

function attachCss(element,type,name){ 
		var attribute = searchElement(element,type,"attribute")
		if(attribute != "notfound"){
		  attribute.nodeValue+= ";"+name;
		//alert(element.attributes[1].nodeName+"  "+element.attributes[1].nodeValue+" haha  freestyle found")
		}else{ 
			element.setAttribute(type,name)   
			//alert(element.attributes[1].nodeName+"  "+element.attributes[1].nodeValue+" haha  freestyle notfound")
		} 
}

function searchElement(element,param,type){
	var result; 
	for(var count = 0; count < element.attributes.length; count++){
		var check;
		if(type == "attribute"){
			check = element.attributes[count].nodeName.toLowerCase();
		}else if(type == "value"){
			check = element.attributes[count].nodeValue.toLowerCase()
		}
		if(check == param.toLowerCase()){
			result = element.attributes[count] 
			break;
		}else {
			result = "notfound"
		}
		
	}
	if(result == undefined)
		result = "notfound" 
	return result;
}

function traceIcsid(icsid){
	var result = new Array()
	var resultCounter = 0;
	for(var count = 0; count < icsidList.length; count++){
		var element = icsidList[count] 
		if(element.icsid == icsid){
			result[resultCounter] = element
			resultCounter++;
		}
	}
	//alert(icsidList.length)
	return result;
}

function occurrence(string,chr){
	var result = new Array()
	var resultCounter = 0;
	if(searchString(string,chr)){
		result[resultCounter] = string.indexOf(chr)
		var newString = string.substring(result[resultCounter] + 1); 
		while(newString.indexOf(chr) > -1){
			result[resultCounter++] = newString.indexOf(chr)
			string = newString.substring(result[resultCounter] + 1)
			newString = string
		}
	}
	return result
}

/**
* This method searches a javascript string for the passed paremeter
* argument
* @param text
* @param chr
*/
function searchString(text,chr){
	var reg = new RegExp(".*"+chr+".*");  
	var found = reg.test(text.trim())
	var hReg = new RegExp("[\"]+(.)*"+chr+"(.)*([\"]+)") 
	var firstFound = (text.split(chr).length > 0 )?text.split(chr)[0]+""+chr+""+text.split(chr)[1]:text;
	var hardCoded = hReg.test(firstFound.trim())
	var plusReg = new RegExp("[\"]+[+]{1}(.)*"+chr+"[+]*(.)*([\"]+)");
	var pNotHardCoded = plusReg.test(firstFound.trim())
	
	//# toTwenty -> "jk",go-> "come->there-> what's up #makeElement('go')", come ->  "#makeElement('that')";
	//^([^\s&&[^\"']]*([^\s&&[^\"]]*)+)"+chr+"(.*)$
	//alert(text)
	var masterReg = new RegExp("^(([^\s&&[^\"']]*([^\s&&[^\"]]*)+)|(.*([\"']{1}[+,]{1}){1})|([^\s&&[^\"]]*)*)"+chr+"(.*)$")
	var pass = masterReg.test(text.trim())
	
	//if(text.indexOf("\"") > -1)
		//alert(text.length+""+text+" \n"+chr+" \n"+text.indexOf("\"")+" \n"+reg.test(text.trim())+"\n"+hardCoded+"  ")
	
	return found;
}

	
function searchkeywords(text,chr){
	var masterReg = new RegExp("^(([^\"']*)|(.*([\"']{1}[+,]{1}){1})([^\"']+[+])*)"+chr+"(.*)$")  //new RegExp(^(([^\s&&[^\"']]*([^\s&&[^\"']]*)+)|(.*([\"']{1}[+,]{1}){1})+)+"+chr+"(.*)$")
	var pass = masterReg.test(text.trim())
	//alert(text.trim()+" "+chr+" ")
	return pass;
}

function findKeywords(text,chr){
	return keywords(text,chr,"")[0] != text
}

function keywords(text,chr,newChr,initiateReplace){
	text+= "E"
	var outputString = new Array();
	var replacedOutput = ""
	var outputStringCounter = 0;
	var textArray = text.split("")
	var singleQuoteNum = 0;
	var doubleQuoteNum = 0; 
	var useSingleQuote;
	var useDoubleQuote;
	var lastLocation = 0; 
	var splitFoundNow;
	
	function quoteQuery(remainingString){ 
		
		useSingleQuote = remainingString.indexOf("'") < remainingString.indexOf("\"");
		useDoubleQuote = remainingString.indexOf("\"") < remainingString.indexOf("'");  
		if(remainingString.indexOf("'") > -1 && remainingString.indexOf("\"") > -1){
			useSingleQuote = remainingString.indexOf("'") < remainingString.indexOf("\"");
			useDoubleQuote = remainingString.indexOf("\"") < remainingString.indexOf("'");
		}else{
			if(remainingString.indexOf("'") > -1){
				useSingleQuote = true
				useDoubleQuote = false
			}else if(remainingString.indexOf("\"") > -1){
				useSingleQuote = false
				useDoubleQuote = true
			}else{
				useSingleQuote = false
				useDoubleQuote = false
			}
		}
		singleQuoteNum = 0;
		doubleQuoteNum = 0; 
	}
	
	function addFound(){
		var tempString = text.substring(lastLocation ,count - 1);
		outputString[outputStringCounter] = tempString;
		replacedOutput+= tempString+newChr
		lastLocation = count + (chr.length - 1); 
		outputStringCounter++   
		//quoteQuery(text.substring(count+1)); 
		splitFoundNow = true
	}
	
	quoteQuery(text)
	for(var count = 1; count <= textArray.length; count++){
		splitFoundNow = false
		var chrRefrence = "";
		if(count + (chr.length - 1) < textArray.length){
			for(var icount = 0; icount < chr.length; icount++){
				chrRefrence+= textArray[(count - 1)+icount]
			}
			if(useSingleQuote){ 
				singleQuoteNum+= (textArray[count-1] == "'")?1:0;
				if(count - 2 > -1 ){
					singleQuoteNum+= (textArray[count - 2] == "\\" && textArray[count-1] == "'")?-1:0;
				} 
				if(chrRefrence == chr && singleQuoteNum % 2 == 0){
					addFound();
				} 
				if(singleQuoteNum % 2 == 0 && singleQuoteNum > 0){ 
					quoteQuery(text.substring(count+1));
				}
			}else if(useDoubleQuote){	
				doubleQuoteNum+= (textArray[count-1] == "\"")?1:0; 
				if(count - 2 > -1 ){ 
					doubleQuoteNum+= (textArray[count - 2] == "\\" && textArray[count-1] == "\"")?-1:0; 
				}
				if(chrRefrence == chr && doubleQuoteNum % 2 == 0){
					addFound();
				} 
				if(doubleQuoteNum % 2 == 0 && doubleQuoteNum > 0){ 
					quoteQuery(text.substring(count+1));
				}
			}else if(!useSingleQuote && !useDoubleQuote){
				if(chrRefrence == chr){
					addFound()
				}
			}  
		}else if(count + (chr.length - 1) == textArray.length && !splitFoundNow && outputStringCounter > 0){
			var tempString = text.substring(lastLocation,count + (chr.length - 1)); 
			outputString[outputStringCounter ] = tempString.slice(0,-1);
			replacedOutput+= tempString.slice(0,-1)
		} 
	}
	
	if(newChr.length > 0 || initiateReplace){
		if(outputStringCounter == 0){
			replacedOutput = text.slice(0,-1)
		}
		return replacedOutput
	}else{
		if(outputStringCounter == 0){
			outputString[0] = text.slice(0,-1)
		}
		return outputString
	}
}

function codeSpliterKeyWords(text,chr,newChr,initiateReplace,pString,inRange){
	text+= "E"
	var outputString = new Array(),
		replacedOutput = "",
		outputStringCounter = 0,
		textArray = text.split(""),
		singleQuoteNum = 0,
		doubleQuoteNum = 0,
		useSingleQuote,
		useDoubleQuote,
		lastLocation = 0,
		pOString = pString.split(":")[0],
		pCString = pString.split(":")[1],
		pStringCount = 0,
		splitFoundNow;
	
	function pStringMonitor(ch){
		if(ch == pOString || ch == pCString){
			if(pStringCount == 0){
				pStringCount+= ch == pOString?1:0;
			}else if(pStringCount > 0){
				pStringCount+= ch == pCString?1:0;
			}
		}
	}
	
	function quoteQuery(remainingString){ 
		
		useSingleQuote = remainingString.indexOf("'") < remainingString.indexOf("\"");
		useDoubleQuote = remainingString.indexOf("\"") < remainingString.indexOf("'");  
		if(remainingString.indexOf("'") > -1 && remainingString.indexOf("\"") > -1){
			useSingleQuote = remainingString.indexOf("'") < remainingString.indexOf("\"");
			useDoubleQuote = remainingString.indexOf("\"") < remainingString.indexOf("'");
		}else{
			if(remainingString.indexOf("'") > -1){
				useSingleQuote = true
				useDoubleQuote = false
			}else if(remainingString.indexOf("\"") > -1){
				useSingleQuote = false
				useDoubleQuote = true
			}else{
				useSingleQuote = false
				useDoubleQuote = false
			}
		}
		singleQuoteNum = 0;
		doubleQuoteNum = 0; 
	}
	
	function addFound(){
		var tempString = text.substring(lastLocation ,count - 1);
		outputString[outputStringCounter] = tempString;
		replacedOutput+= tempString+newChr
		lastLocation = count + (chr.length - 1); 
		outputStringCounter++   
		//quoteQuery(text.substring(count+1)); 
		splitFoundNow = true
		if(pStringCount % 2 == 0){
			//alert("got here "+pString)
			pStringCount = 0
		}
	}
	
	quoteQuery(text)
	for(var count = 1; count <= textArray.length; count++){
		splitFoundNow = false
		var chrRefrence = "";
		if(count + (chr.length - 1) < textArray.length){
			for(var icount = 0; icount < chr.length; icount++){
				chrRefrence+= textArray[(count - 1)+icount]
			}
			pStringMonitor(chrRefrence)
			if(useSingleQuote){ 
				singleQuoteNum+= (textArray[count-1] == "'")?1:0;
				if(count - 2 > -1 ){
					singleQuoteNum+= (textArray[count - 2] == "\\" && textArray[count-1] == "'")?-1:0;
				} 
				if(pStringCount % 2 == 0){
					if(chrRefrence == chr && singleQuoteNum % 2 == 0){
						addFound();
					}
				}					
				if(singleQuoteNum % 2 == 0 && singleQuoteNum > 0){ 
					quoteQuery(text.substring(count+1));
				} 
			}else if(useDoubleQuote){	
				doubleQuoteNum+= (textArray[count-1] == "\"")?1:0; 
				if(count - 2 > -1 ){ 
					doubleQuoteNum+= (textArray[count - 2] == "\\" && textArray[count-1] == "\"")?-1:0; 
				}
				if(pStringCount % 2 == 0){
					if(chrRefrence == chr && doubleQuoteNum % 2 == 0){
						addFound();
					} 
				}
				if(doubleQuoteNum % 2 == 0 && doubleQuoteNum > 0){ 
					quoteQuery(text.substring(count+1));
				} 
			}else if(!useSingleQuote && !useDoubleQuote){
				if(pStringCount % 2 == 0){
					if(chrRefrence == chr){
						addFound()
					}
				}
			}  
		}else if(count + (chr.length - 1) == textArray.length && !splitFoundNow && outputStringCounter > 0){
			var tempString = text.substring(lastLocation,count + (chr.length - 1)); 
			outputString[outputStringCounter ] = tempString.slice(0,-1);
			replacedOutput+= tempString.slice(0,-1)
		} 
	}
	
	if(newChr.length > 0 || initiateReplace){
		if(outputStringCounter == 0){
			replacedOutput = text.slice(0,-1)
		}
		return replacedOutput
	}else{
		if(outputStringCounter == 0){
			outputString[0] = text.slice(0,-1)
		}
		return outputString
	}
}

/**
* This method splits a javascript string to character arrays 
* @param string
*/
function stringToArray(string){ 
	var result = new Array();
	var count1 = 0, count2 = 1;
	while(true){
		result[count1] = string.substring(count1,count2);
		count1++; count2++;
		if(count1 == string.length){ 
			return result;
		}
	} 
}




var NodeOperator = {
	elementName: "*",
	inputFormat: new RegExp("text|password|check|radio|submit|image|reset|button|file|checked|enabled|disabled|selected"),
	inputStateFormat: new RegExp("selected|checked|enabled|disabled"),
	nodeWithId: function(value){ 
		var elementName = NodeOperator.elementName
		var allTags = document.getElementsByTagName(elementName); 
		var results = new Array(); 
		var resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){  
			if(elementName != "*" && (allTags[counter1].nodeName.toLowerCase() != elementName.toLowerCase())){
				continue;
			}
			var attrNode = allTags[counter1].getAttributeNode("id")
			 if(attrNode != undefined && attrNode.nodeValue == value){ 
				results[resultCounter] = allTags[counter1];
				resultCounter++;    
			} 
		}
		NodeOperator.elementName = "*"
		return results;
	},
	nodeWithClass: function(value){ 
		var elementName = NodeOperator.elementName
		var allTags = document.getElementsByTagName(elementName); 
		var results = new Array(); 
		var resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){  
			if(elementName != "*" && (allTags[counter1].nodeName.toLowerCase() != elementName.toLowerCase())){
				continue;
			}
			var attrNode = allTags[counter1].getAttributeNode("class")
			 if(attrNode != undefined && attrNode.nodeValue == value){ 
				results[resultCounter] = allTags[counter1];
				resultCounter++;    
			} 
		}
		NodeOperator.elementName = "*"
		return results;
	},
	inputNodeWithType: function(value){ 
		var elementName = NodeOperator.elementName,
			allTags = document.getElementsByTagName(elementName), 
			results = [], 
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){  
			if(elementName != "*" && (allTags[counter1].nodeName.toLowerCase() != elementName.toLowerCase())){
				continue;
			}
			//var attrNodes = allTags[counter1].attributes;
			//for(var counter2 = 0; counter2 < attrNodes.length; counter2++){
				//var currentAttribute = attrNodes[counter2];  
				if(elementName.toLowerCase() != "option"){
					if(allTags[counter1].getAttributeNode("type") != undefined && allTags[counter1].getAttributeNode("type").nodeValue.toLowerCase() == value.toLowerCase()){ 
						results[resultCounter] = allTags[counter1];
						resultCounter++;
					}else if(allTags[counter1].getAttributeNode("checked") != undefined && allTags[counter1].getAttributeNode("checked").nodeValue.toLowerCase() == "checked"){ 
						results[resultCounter] = allTags[counter1];
						resultCounter++;
					}else if(allTags[counter1].getAttributeNode("disabled") != undefined && allTags[counter1].getAttributeNode("disabled").nodeValue.toLowerCase() == "disabled"){ 
						results[resultCounter] = allTags[counter1];
						resultCounter++;
					}
				}else{
					//alert("GOt here also man processing "+value)
					if(allTags[counter1].getAttributeNode("selected") != undefined){ 
						results[resultCounter] = allTags[counter1];
						resultCounter++;
					}
				}
			//}
		}
		NodeOperator.elementName = "*"
		return results;
	},
	nodeVisiblityState: function(value){ 
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName) , 
			results = new Array(),
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){  
			var attrNodes = allTags[counter1].attributes; 
			if(value == "visible"){
				if(allTags[counter1].style.display.trim().toLowerCase() != "none" && allTags[counter1].style.display.trim().toLowerCase() != ""){ 
					results[resultCounter] = allTags[counter1];
					resultCounter++; 
				}
			}else if(value == "hidden"){
				if(allTags[counter1].style.display.trim().toLowerCase() == "none"){ 
					results[resultCounter] = allTags[counter1];
					resultCounter++; 
				}
			}
		} 
		NodeOperator.elementName = "*"
		return results;
	},
	nodeContainsText: function(value){ 
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName) ,
			results = [],
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){  
			for(var icount = 0; icount < allTags[counter1].childNodes.length; icount++){
				var childNode = allTags[counter1].childNodes[icount]
				if(childNode.nodeName == "#text" && childNode.nodeValue.search(value) != -1){
					results[resultCounter] = allTags[counter1];
					resultCounter++; 
				}
			} 
		} 
		NodeOperator.elementName = "*"
		return results;
	},
	nodeIsEmpty: function(){ 
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName) ,
			results = [],
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){   
			if(allTags[counter1].innerHTML.trim().length == 0){ 
					results[resultCounter] = allTags[counter1];
					resultCounter++; 
			}
		} 
		NodeOperator.elementName = "*"
		return results;
	},
	nodeByIndex: function(iref,index){ 
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0,
			indexCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){   
			for(var icount = 0; icount < allTags[counter1].childNodes.length; icount++){
				var childElement = allTags[counter1].childNodes[icount]
				if(childElement.nodeName == "#text"){
					continue
				}
				if(iref.trim() == "eq" && indexCounter == index){
					results[resultCounter] = childElement
					resultCounter++;  
				}else if(iref.trim() == "lt" && indexCounter < index){
					results[resultCounter] = childElement;
					resultCounter++; 
				}else if(iref.trim() == "gt" && indexCounter > index){
					results[resultCounter] = childElement;
					resultCounter++; 
				}
				indexCounter++
			}
		} 
		NodeOperator.elementName = "*"
		return results;
	},
	nodeFirstLastChild: function(iref){ 
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0,
			indexCounter = 0; 
		for(var counter1 = 0; counter1 < allTags.length; counter1++){    
			if(iref.trim() == "first-child"){
					var childElement = allTags[counter1].childNodes[0].nodeName == "#text"?allTags[counter1].childNodes[0].nextSibling
									:allTags[counter1].childNodes[0];
					results[resultCounter] = childElement
					resultCounter++;  
			}else if(iref.trim() == "last-child"){
					//alert("Look at me : "+childElement)
					var childElement = allTags[counter1].childNodes[(allTags[counter1].childNodes.length - 1)].nodeName == "#text"?allTags[counter1].childNodes[(allTags[counter1].childNodes.length - 1)].previousSibling
									:allTags[counter1].childNodes[(allTags[counter1].childNodes.length - 1)];
					results[resultCounter] = childElement;
					resultCounter++; 
			} 
			
		} 
		NodeOperator.elementName = "*"
		return results;
	},
	nodeIndexEvenOrOdd: function(target,iref){ 
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName) ,
			results = [],
			resultCounter = 0,
			indexCounter = 1;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){  
			for(var icount = 0; icount < allTags[counter1].childNodes.length; icount++){
				var childElement = allTags[counter1].childNodes[icount]
				var targetElements = SelectorOperator.selectorExtractor(target.toLowerCase())
				for(var count3 = 0; count3 < targetElements.length; count3++){
					if(childElement.nodeName != "#text" && childElement == targetElements[count3]){  
						if(iref == "even" && indexCounter % 2 == 0){
							results[resultCounter] = childElement;
							resultCounter++;  
						}else if(iref == "odd" && indexCounter  % 2 == 1){ 
							results[resultCounter] = childElement;
							resultCounter++; 
						} 
						indexCounter++
						break
					}
				}
			}
		} 
		NodeOperator.elementName = "*"
		return results;
	},
	nodeWithElement: function(child){
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){
			var currentElement = allTags[counter1] 
			for(var icount = 0; icount < currentElement.childNodes.length; icount++){ 
				var currentChild = currentElement.childNodes[icount] 
				var childElements = SelectorOperator.selectorExtractor(child); 
				for(var count3 = 0; count3 < childElements.length; count3++){ 
					if(currentChild == childElements[count3]){
						results[resultCounter] = currentChild;
						resultCounter++;
						break
					}
				}
			} 
		}
		NodeOperator.elementName = "*"
		return results
	},
	nodeAfterElement: function(child){
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){
			var currentElement = allTags[counter1]  
			if(currentElement.nextSibling == null){
				continue
			} 
			var nextChild = currentElement.nextElementSibling; 
			var childElements = SelectorOperator.selectorExtractor(child); 
			for(var count2 = 0; count2 < childElements.length; count2++){ 
				//alert("Im even here gan "+childElements)
				if(nextChild == childElements[count2]){
					results[resultCounter] = nextChild;
					resultCounter++;
					break
				}
			}
		}
		NodeOperator.elementName = "*"
		return results
	},
	nodeBeforeElement: function(child){
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){
			var currentElement = allTags[counter1]  
			if(currentElement.previousSibling == null){
				continue
			} 
			var previousChild = currentElement.previousElementSibling; 
			var childElements = SelectorOperator.selectorExtractor(child); 
			for(var count2 = 0; count2 < childElements.length; count2++){ 
				//alert("Im even here gan "+childElements)
				if(previousChild == childElements[count2]){
					results[resultCounter] = previousChild;
					resultCounter++;
					break
				}
			}
		}
		NodeOperator.elementName = "*"
		return results
	},
	nodeWithAttributes: function(attribName){ 
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){  
			var attrNodes = allTags[counter1].attributes;
			if(allTags[counter1].hasAttribute(attribName)){ 
				results[resultCounter] = allTags[counter1];
				resultCounter++;    
			}
		}
		NodeOperator.elementName = "*"
		return results;
	},
	nodeAtrributeAndValue: function(attribName,value){ 
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){  
			var attrNode = allTags[counter1].getAttributeNode(attribName)
			 if(attrNode != undefined && attrNode.nodeValue == value){ 
				results[resultCounter] = allTags[counter1];
				resultCounter++;    
			}
		}
		NodeOperator.elementName = "*"
		return results;
	},
	nodeAtrributeWithoutValue: function(attribName,value){ 
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){   
			var attrNode = allTags[counter1].getAttributeNode(attribName)
			 if(attrNode != undefined && attrNode.nodeValue != value){ 
				results[resultCounter] = allTags[counter1];
				resultCounter++;    
			}
		}
		NodeOperator.elementName = "*"
		return results;
	},
	nodeAtrributeValueStartsWith: function(attribName,value){ 
	var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){ 
			var attrNode = allTags[counter1].getAttributeNode(attribName)
			if(attrNode != undefined && attrNode.nodeValue.substring(0,value.length) == value){ 
				results[resultCounter] = allTags[counter1];
				resultCounter++;    
			} 
		}
		NodeOperator.elementName = "*"
		return results;
	},
	nodeAtrributeValueEndsWith: function(attribName,value){  
	var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){   
			var attrNode = allTags[counter1].getAttributeNode(attribName)
			if(attrNode != undefined && attrNode.nodeValue.length >= value.length){
				if(attrNode != undefined && attrNode.nodeValue.substring((attrNode.nodeValue.length - value.length),attrNode.nodeValue.length) == value){ 
					results[resultCounter] = allTags[counter1];
					resultCounter++;    
				}
			} 
		}
		NodeOperator.elementName = "*"
		return results;
	},
	nodeAtrributeValueContains: function(attribName,value){ 
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0;
		for(var counter1 = 0; counter1 < allTags.length; counter1++){  
			var attrNode = allTags[counter1].getAttributeNode(attribName)
			 if(attrNode != undefined && attrNode.nodeValue.search(value) > -1){ 
				results[resultCounter] = allTags[counter1];
				resultCounter++;    
			} 
		}
		NodeOperator.elementName = "*"
		return results;
	},
	nodeNotSelectors: function(selectors){
		var elementName = NodeOperator.elementName,
			allTags = SelectorOperator.selectorExtractor(elementName),
			results = [],
			resultCounter = 0, 
			pass;
			
		for(var counter1 = 0; counter1 < allTags.length; counter1++){   
			pass = true
			for(var selCounter = 0; selCounter < selectors.length; selCounter++){
				if(!pass){
					break
				}
				var currentSelectorElements = SelectorOperator.selectorExtractor(selectors[selCounter])
				for(var counter3 = 0; counter3 < currentSelectorElements.length; counter3++){
					pass = allTags[counter1] != currentSelectorElements[counter3]
					if(!pass){
						break
					}
				}
			}
			if(pass){
				results[resultCounter] = allTags[counter1]
				resultCounter++
			}
		} 
		NodeOperator.elementName = "*"
		return results;
			
	} 
}

function stringStartsWith(string,text){
	return string.slice(0,text.length) == text
}

function stringEndsWith(string,text){
	return string.slice((string.length - text.length),string.length) == text
}

function stringContains(string,text){
	return string.search(text) != -1
}

/**
* This method is used by ics script to retrieve all Elements 
* whose attributes contains the passed parameter <b>value</b>
* @param value
*/
function traceAtrribute(value){
	var allTags = document.getElementsByTagName("*"); 
	var results = new Array(); 
	var resultCounter = 0;
	for(var counter1 = 0; counter1 < allTags.length; counter1++){  
		var attrNodes = allTags[counter1].attributes;
		for(var counter2 = 0; counter2 < attrNodes.length; counter2++){
			var currentAttribute = attrNodes[counter2]; 
			if(currentAttribute.nodeValue == value){ 
				results[resultCounter] = allTags[counter1];
				resultCounter++;    
			}
		}
	}
	return results;
}

/**
* This method is used by ics script to retrieve all Elements 
* that contains  an <b>Attribute and  Value</b> pair that 
* matches that of the passed arguments
* @param attribName
* @param value
*/
function traceBoth(attribName,value){ 
	var allTags = document.getElementsByTagName("*"); 
	var results = new Array(); 
	var resultCounter = 0;
	for(var counter1 = 0; counter1 < allTags.length; counter1++){  
		var attrNodes = allTags[counter1].attributes;
		for(var counter2 = 0; counter2 < attrNodes.length; counter2++){
			var currentAttribute = attrNodes[counter2]; 
			if(currentAttribute.nodeName == attribName && currentAttribute.nodeValue == value){ 
				results[resultCounter] = allTags[counter1];
				resultCounter++;
			}
		}
	}
	return results;
}
