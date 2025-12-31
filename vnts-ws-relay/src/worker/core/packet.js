import { PACKET_HEADER_SIZE, ENCRYPTION_RESERVED } from './constants.js';  
  
export class NetPacket {  
  constructor(data) {  
    this.data = data;  
    this.offset = 0;  
  }  
  
  static parse(buffer) {  
    if (buffer.length < PACKET_HEADER_SIZE) {  
      throw new Error('Packet too short');  
    }  
      
    const packet = new NetPacket(buffer);  
    packet.parseHeader();  
    return packet;  
  }  
  
  parseHeader() {  
    const view = new DataView(this.data.buffer);  
      
    // 读取 VNT 协议头部  
    this.protocol = view.getUint8(0);  
    this.transportProtocol = view.getUint8(1);  
    this.flags = view.getUint16(2, true); // little endian  
    this.ttl = view.getUint8(4);  
    this.source = view.getUint32(5, true);  
    this.destination = view.getUint32(9, true);  
      
    this.offset = PACKET_HEADER_SIZE;  
  }  
  
  protocol() {  
    return this.protocol;  
  }  
  
  transport_protocol() {  
    return this.transportProtocol;  
  }  
  
  source() {  
    return this.source;  
  }  
  
  destination() {  
    return this.destination;  
  }  
  
  payload() {  
    return this.data.slice(this.offset);  
  }  
  
  is_encrypt() {  
    return (this.flags & 0x01) !== 0;  
  }  
  
  is_gateway() {  
    return (this.flags & 0x02) !== 0;  
  }  
  
  incr_ttl() {  
    this.ttl++;  
    const view = new DataView(this.data.buffer);  
    view.setUint8(4, this.ttl);  
    return this.ttl;  
  }  
  
  buffer() {  
    return this.data;  
  }  
  
  static new_encrypt(size) {  
    const totalSize = PACKET_HEADER_SIZE + size + ENCRYPTION_RESERVED;  
    const buffer = new Uint8Array(totalSize);  
    return new NetPacket(buffer);  
  }  
}
