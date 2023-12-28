/*******************************************************************************

            7 December MMXXI PUBLIC DOMAIN by Jean-Marc Lienher

            The authors disclaim copyright to this source code.

 ******************************************************************************/

class Fs {

static mkfolder(callback) {
        document.getElementById("func").value = "mkfolder";
	Fs.request("text", callback);
}

static mkdir(path, callback) {
        document.getElementById("func").value = "mkdir";
        document.getElementById("target").value = path.to_string();
	Fs.request("text", callback);
}

static read(path, seek, size, callback) {
        document.getElementById("func").value = "read";
        document.getElementById("target").value = path.to_string();
        document.getElementById("seek").value = seek;
        document.getElementById("size").value = size;
	Fs.request("arraybuffer", callback);
}

static filesize(path, callback) 
{
        document.getElementById("func").value = "filesize";
        document.getElementById("target").value = path.to_string();
	Fs.request("text", callback);
}

static scandir(path, callback) {
        document.getElementById("func").value = "scandir";
        document.getElementById("target").value = path.to_string();
	Fs.request("text", callback);
}

static rmdir(path, callback) {
        document.getElementById("func").value = "rmdir";
        document.getElementById("target").value = path.to_string();
	Fs.request("text", callback);
}

static unlink(path, callback) {
        document.getElementById("func").value = "unlink";
        document.getElementById("target").value = path.to_string();
	Fs.request("text", callback);
}

static write(path, data, seek, size, callback) {
	let file = new File([data.buffer.subarray(0, data.length)], path,
		{type:"application/octet-stream", 
			lastModified:new Date().getTime()});
	let container = new DataTransfer();
	container.items.add(file);
        document.getElementById("func").value = "write";
        document.getElementById("target").value = path.to_string();
        document.getElementById("seek").value = seek;
        document.getElementById("size").value = size;
        document.getElementById("files").files=container.files;
	//console.log(document.getElementById("folder").value);
	Fs.request("text", callback);
}

static call_cb(r, type, clb)
{
    if (type === "arraybuffer") {
		clb.response.from_array(r.response);
    } else {
		clb.response.from_string(r.response);
    }
    clb.status = r.status | 0;
    clb.exec(null, null);
}

static request(type, callback) {
 	const f = document.getElementById("ajax");
        if (typeof window.sendRequest !== "undefined") { // nodejs
		let r = null;
                if (document.getElementById("files").files.length > 0) {
                        document.getElementById("files").files[0].arrayBuffer().then(
                                function (buf) {
                                        r = window.sendRequest(new Uint8Array(buf), f, type);
					Fs.call_cb(r, type, callback);
                                        f.func.value = "";
                                        f.files.value = "";
                                }
                        )
                } else {
                        r = window.sendRequest(null, f, type);
			Fs.call_cb(r, type, callback);
                        f.func.value = "";
                        f.files.value = "";  
                }

                return;
        }
        return Fs.HttpRequest(type, callback);
}

static HttpRequest(type, callback) {
        const xhr = new XMLHttpRequest();        
        const fd = new FormData(f);
        xhr.open('POST', f.action);
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.responseType = type; //"arraybuffer";

        xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                                console.log(xhr.response);
				
                        } else {
                                console.log('Error: ' + xhr.status);
                        }
			let s = new ZjBuf(8);
			if (xhr.responseType == "arraybuffer") {
				s.from_array(xhr.response);
			} else {
				s.from_string(xhr.response);
			}
			callback.set(xhr.status, s);
			callback.exec(null, null);
			s.dispose();
                }
        };
 
        xhr.send(fd);
	f.func.value = "";
	//console.log(f.files.files);
	f.files.value = "";
}

}; // class

