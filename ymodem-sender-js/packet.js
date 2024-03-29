"use strict";

let crc16 = require("./crc16")

const SOH = 0x01 /* start of 128-byte data packet */
const STX = 0x02  /* start of 1024-byte data packet */
const EOT = 0x04  /* end of transmission */
const ACK = 0x06 /* acknowledge */
const NAK = 0x15 /* negative acknowledge */
const CA = 0x18 /* two of these in succession aborts transfer */
const CRC16 = 0x43  /* 'C' == 0x43, request 16-bit CRC */
const NEGATIVE_BYTE = 0xFF

const ABORT1 = 0x41  /* 'A' == 0x41, abort by user */
const ABORT2 = 0x61  /* 'a' == 0x61, abort by user */

const NAK_TIMEOUT = 10000
const DOWNLOAD_TIMEOUT = 1000 /* One second retry delay */
const MAX_ERRORS = 10

const NORMAL_LEN = 128;
const LONG_LEN = 1024;
const DATA_INDEX = 3;

let bUse1K = false;

function getNormalPacket(id, contentBuf) {
  let buf = new Buffer.alloc(NORMAL_LEN + 3 + 2);
  let i = 0;
  buf[i++] = SOH;

  buf[i++] = id;
  buf[i++] = 0xFF - id;

  if (contentBuf.length > NORMAL_LEN) {
    throw new Error("Over normal packet size limit");
  }

  for (let j = 0; j < contentBuf.length; j++) {
    buf[i++] = contentBuf[j];
  }

  while (i < NORMAL_LEN + 3) {
    buf[i++] = 0x1A;
  }
  let bufcrc = buf.slice(3, 3 + NORMAL_LEN)
  let crc = crc16(bufcrc, NORMAL_LEN);

  buf[i++] = (crc >> 8) & 0xFF;
  buf[i++] = crc & 0xFF;

  console.log("packet forming End i = ", i);

  return buf;
}

function getLongPacket(id, contentBuf) {
  let buf = new Buffer.alloc(LONG_LEN + 3 + 2);
  let i = 0;
  buf[i++] = STX;

  buf[i++] = id;
  buf[i++] = 0xFF - id;

  if (contentBuf.length > LONG_LEN) {
    throw new Error("Over long packet size limit");
  }

  for (let j = 0; j < contentBuf.length; j++) {
    buf[i++] = contentBuf[j];
  }

  while (i < NORMAL_LEN + 3) {
    buf[i++] = 0x1A;
  }
  let bufcrc = buf.slice(3, LONG_LEN + 3)
  let crc = crc16(bufcrc, LONG_LEN);

  buf[i++] = (crc >> 8) & 0xFF;
  buf[i++] = crc & 0xFF;

  console.log("packet forming End i = ", i);

  return buf;
}
function getZeroContent(fileSymbol, fileLen) {

  let buf = new Buffer.alloc(128);

  let fileLenBuf = Buffer.from(fileLen + '');
  let symbolBuf = Buffer.from(fileSymbol);

  let i = 0, j = 0;
  for (j = 0; j < symbolBuf.length; j++) {
    buf[i++] = symbolBuf[j];
  }
  buf[i++] = 0;
  for (j = 0; j < fileLenBuf.length; j++) {
    buf[i++] = fileLenBuf[j];
  }

  return buf;
}

let packet = {
  getZeroContent: getZeroContent,
  getNormalPacket: getNormalPacket,
  getLongPacket: getLongPacket,

  
  SOH : 0x01, /* start of 128-byte data packet */
  STX: 0x02,  /* start of 1024-byte data packet */
  EOT: 0x04,  /* end of transmission */
  ACK: 0x06,/* acknowledge */
  NAK: 0x15, /* negative acknowledge */
  CA: 0x18, /* two of these in succession aborts transfer */
  CRC16: 0x43,  /* 'C' :: 0x43, request 16-bit CRC */
  NEGATIVE_BYTE: 0xFF,

  ABORT1: 0x41, /* 'A' == 0x41, abort by user */
  ABORT2: 0x61,  /* 'a' == 0x61, abort by user */

  NAK_TIMEOUT: 10000,
  DOWNLOAD_TIMEOUT: 1000, /* One second retry delay */
  MAX_ERRORS: 10,

  NORMAL_LEN: 128,
  LONG_LEN: 1024,
  DATA_INDEX: 3,

  BUse1K: bUse1K,
};

module.exports = packet;