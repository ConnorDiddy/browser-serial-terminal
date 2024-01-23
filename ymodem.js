var g_sequenceNumber;

SOH = 1     // 128 byte blocks
STX = 2     // 1K blocks
EOT = 4
ACK = 6
NAK = 0x15
CA =  0x18          // 24
CRC16 = 0x43        // 67
ABORT1 = 0x41       // 65
ABORT2 = 0x61       // 97

ERROR = -1;

packet_len = 1024
expected_packet_len = packet_len+5
packet_mark = STX

function left_justify(data) {

    length = data.length;

    if (length > 1024) {
        return ERROR;
    } else if (length == 1024) {
        return data;
    }

    difference = 1024 - length;

    for (i=0; i < difference; i++) {
        data += ' ';
    }

    return data;
}

function send_packet(data) {

    response = EOT;

    // pad string to 1024 chars
    data = left_justify(data);

    sequence_char = (g_sequenceNumber & 0xFF);
    sequence_char_neg = ( (-g_sequenceNumber -1) & 0xFF );
    CRC16 = '\x00\x00';
    packet = packet_mark + sequence_char + sequence_char_neg + data + CRC16;

    if (packet.length != expected_packet_len) {
        console.log("Packet length is wrong!");
        return ERROR;
    }

    console.log("Sending packet: ", packet);
    written = writer.write(packet);


}

function send_filename_header(file_name, size) {
    g_sequenceNumber = 0;
    packet = file_name + 0x00 + size + " ";
    console.log("Packet header: ", packet);

    return send_packet(packet);
}

async function sendFileYmodem() {
    var fileForTransfer = document.getElementById("file_for_transfer").files[0];
    if (!fileForTransfer) {
        alert("No file was entered.")
        return;
    } else if (!port) {
        //alert("No COM port selected.")
        //return;
    }
    console.log("Sending file: ", fileForTransfer);
    console.log("Serial port: ", port);

    // Open the file
    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            // this will then display a text file
            console.log( reader.result );
        },
        false,
    );

    if (fileForTransfer) {
        reader.readAsBinaryString(fileForTransfer);
    }

    // Grab file size
    console.log("File size: ", fileForTransfer.size)

    send_filename_header(fileForTransfer.name, fileForTransfer.size);
}