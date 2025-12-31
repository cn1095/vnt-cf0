import { NetPacket } from './core/packet.js';  
import { VntContext } from './core/context.js';  
import { PacketHandler } from './core/handler.js';  
import { PROTOCOL, TRANSPORT_PROTOCOL } from './core/constants.js';  
  
export class RelayRoom {  
  constructor(state, env) {  
    this.state = state;  
    this.env = env;  
    this.connections = new Map();  
    this.contexts = new Map();  
    this.packetHandler = new PacketHandler(env);  
  }  
  
  async fetch(request) {  
    const url = new URL(request.url);  
      
    if (url.pathname === '/ws') {  
      return this.handleWebSocket(request);  
    }  
      
    return new Response('Not Found', { status: 404 });  
  }  
  
  async handleWebSocket(request) {  
    const [client, server] = Object.values(new WebSocketPair());  
    server.accept();  
      
    const clientId = this.generateClientId();  
    const addr = this.parseClientAddress(request);  
      
    // 创建 VNT 上下文  
    const context = new VntContext({  
      linkAddress: addr,  
      serverCipher: null  
    });  
      
    this.contexts.set(clientId, context);  
    this.connections.set(clientId, server);  
      
    // 设置 WebSocket 消息处理  
    server.addEventListener('message', async (event) => {  
      await this.handleMessage(clientId, event.data);  
    });  
      
    server.addEventListener('close', () => {  
      this.handleClose(clientId);  
    });  
      
    server.addEventListener('error', (error) => {  
      console.error('WebSocket error:', error);  
      this.handleClose(clientId);  
    });  
      
    return new Response(null, {  
      status: 101,  
      webSocket: client  
    });  
  }  
  
  async handleMessage(clientId, data) {  
    try {  
      const context = this.contexts.get(clientId);  
      const server = this.connections.get(clientId);  
        
      if (!context || !server) {  
        return;  
      }  
        
      // 解析 VNT 数据包  
      const packet = NetPacket.parse(data);  
        
      // 处理数据包  
      const response = await this.packetHandler.handle(  
        context,   
        packet,   
        context.linkAddress  
      );  
        
      // 发送响应  
      if (response) {  
        server.send(response.buffer());  
      }  
        
      // 广播到其他连接（如果需要）  
      await this.broadcastPacket(clientId, packet);  
        
    } catch (error) {  
      console.error('Message handling error:', error);  
    }  
  }  
  
  async broadcastPacket(senderId, packet) {  
    const senderContext = this.contexts.get(senderId);  
      
    for (const [clientId, server] of this.connections) {  
      if (clientId === senderId) continue;  
        
      try {  
        // 根据路由规则决定是否转发  
        if (this.shouldForward(senderContext, packet)) {  
          server.send(packet.buffer());  
        }  
      } catch (error) {  
        console.error('Broadcast error:', error);  
      }  
    }  
  }  
  
  shouldForward(context, packet) {  
    // 实现路由逻辑  
    // 检查是否需要转发到其他节点  
    return packet.protocol() !== PROTOCOL.SERVICE;  
  }  
  
  handleClose(clientId) {  
    const context = this.contexts.get(clientId);  
      
    if (context) {  
      // 清理连接  
      this.packetHandler.leave(context);  
      this.contexts.delete(clientId);  
      this.connections.delete(clientId);  
    }  
  }  
  
  generateClientId() {  
    return Math.random().toString(36).substr(2, 9);  
  }  
  
  parseClientAddress(request) {  
    // 从请求中解析客户端地址  
    const cf = request.cf;  
    return {  
      ip: cf?.colo || 'unknown',  
      port: 0  
    };  
  }  
}
