var port, textEncoder, writableStreamClosed, writer;

    async function connectSerial() {
        try {
            // Prompt user to select any serial port.
            port = await navigator.serial.requestPort();
            await port.open({ 
                baudRate: document.getElementById("baud").value, 
                dataBits: 8,
                flowControl: "none",
                parity: "none",
                stopBits: 1
            });

            textEncoder = new TextEncoderStream();
            writableStreamClosed = textEncoder.readable.pipeTo(port.writable);

            writer = textEncoder.writable.getWriter();
            listenToPort();
        } catch {
            alert("Serial Connection Failed");
        }
    }
    async function sendCharacterNumber() {
        document.getElementById("lineToSend").value = String.fromCharCode(document.getElementById("lineToSend").value);
    }
    async function sendSerialLine() {
        dataToSend = document.getElementById("lineToSend").value;
        if (document.getElementById("addLine").checked == true) dataToSend = dataToSend + "\r\n";
        if (document.getElementById("echoOn").checked == true) appendToTerminal("> " + dataToSend);
        await writer.write(dataToSend);
    }
    async function listenToPort() {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();
        // Listen to data coming from the serial device.
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                // Allow the serial port to be closed later.
                reader.releaseLock();
                break;
            }
            // value is a string.
            appendToTerminal(value);
        }
    }
    const serialResultsDiv = document.getElementById("serialResults");
    async function appendToTerminal(newStuff) {
        serialResultsDiv.innerHTML += newStuff;
        if (serialResultsDiv.innerHTML.length > 3000) serialResultsDiv.innerHTML = serialResultsDiv.innerHTML.slice(serialResultsDiv.innerHTML.length - 3000);

        //scroll down to bottom of div
        serialResultsDiv.scrollTop = serialResultsDiv.scrollHeight;
    }
    document.getElementById("lineToSend").addEventListener("keyup", async function (event) {
        if (event.keyCode === 13) {
            sendSerialLine();
        }
    })
    document.getElementById("baud").value = (localStorage.baud == undefined ? 115200 : localStorage.baud);
    document.getElementById("addLine").checked = (localStorage.addLine == "false" ? false : true);
    document.getElementById("echoOn").checked = (localStorage.echoOn == "false" ? false : true);