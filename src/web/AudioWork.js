class AudioWork extends AudioWorkletProcessor {

constructor() 
{
	super();
}
       
process(inputList, outputList, parameters) 
{
	this.port.postMessage(inputList);
	
	const output = outputList[0];
	const input = inputList[0];
    	output.forEach(channel => {
      		for (let i = 0; i < channel.length; i++) {
        	channel[i] = input[0][i];
     	 	}	
    	})
	return true;
}
} // class
      
registerProcessor('data-reader', AudioWork);
      