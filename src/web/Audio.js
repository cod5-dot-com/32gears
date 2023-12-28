
/*******************************************************************************

          22 January MMXXII PUBLIC DOMAIN by Jean-Marc Lienher

            The authors disclaim copyright to this source code.

 ******************************************************************************/

class Audio {

static $(o) { return o; }

constructor() 
{
	this.out = null;
	this.in = null;
	this.context = null;
	this.buf = null;
	this.source = null;
	this.dest = null;
	this.next_time = 0.0;
	this.delay = 0.0;
	this.index = 0;
}

dispose() 
{
   
    delete this;
}

init()
{
	this.context = new AudioContext();
	this.dest = this.context.createMediaStreamDestination();
	this.out =  document.getElementById("audiooutput");
	this.source = new AudioBufferSourceNode(this.context);
	this.out.srcObject = this.dest.stream;

	let promise = navigator.mediaDevices.getUserMedia({ audio: true, video: false });
	promise.then(this.mediaCB.bind(this));
	this.buf  = this.context.createBuffer(2, 2048, this.context.sampleRate);
	this.source.connect(this.dest);
	this.delay = this.buf.getChannelData(0).length / this.context.sampleRate;
}

inCB(input_list)
{
	let t = this.context.currentTime;
	for (let c = 0; c < this.buf.numberOfChannels; c++) {
		let n = this.buf.getChannelData(c);
		let s = input_list[0][0];
		let m = s.length;
		let j = this.index;
		for (let i = 0; i < m; i++, j++) {
			n[j] = s[i];
		}
	}
	this.index += input_list[0][0].length;
	if (this.index < this.buf.getChannelData(0).length) {
		return;
	}
	this.index = 0;
	this.source = this.context.createBufferSource();
	this.source.buffer = this.buf;
	this.source.connect(this.dest);
	this.source.start(this.next_time + 0.05);
	
	this.next_time += this.delay;
	if (this.next_time < t) {
		console.log("Overload " + Math.floor(this.context.currentTime));
		this.next_time = t + 0.1;
	}
}

static WorkMessageCB(event)
{
	this.inCB(event.data);
}

mediaCB(stream)
{
	this.in = this.context.createMediaStreamSource(stream);
	let promise = this.context.audioWorklet.addModule('AudioWork.js');
	promise.then(this.workletCB.bind(this));
}

workletCB()
{
	let WorkNode = new AudioWorkletNode(this.context, 'data-reader');
	WorkNode.port.onmessage = Audio.WorkMessageCB.bind(this);
	this.in.connect(WorkNode); 
	this.next_time = this.context.currentTime + 0.1;
}

} // class
