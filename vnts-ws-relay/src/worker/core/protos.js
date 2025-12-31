import root from './protos_generated.js';  
  
let cachedTypes;  
  
export function loadProtos() {  
  if (cachedTypes) return cachedTypes;  
    
  return cachedTypes = {  
    root,  
    // VNT 消息类型  
    HandshakeRequest: root.message.HandshakeRequest,  
    HandshakeResponse: root.message.HandshakeResponse,  
    SecretHandshakeRequest: root.message.SecretHandshakeRequest,  
    RegistrationRequest: root.message.RegistrationRequest,  
    RegistrationResponse: root.message.RegistrationResponse,  
    DeviceInfo: root.message.DeviceInfo,  
    DeviceList: root.message.DeviceList,  
    PunchInfo: root.message.PunchInfo,  
    ClientStatusInfo: root.message.ClientStatusInfo,  
    RouteItem: root.message.RouteItem,  
      
    // 枚举类型  
    PunchNatType: root.message.PunchNatType,  
    PunchNatModel: root.message.PunchNatModel,  
  };  
}  
  
export function createHandshakeRequest(version, secret, keyFinger) {  
  const types = loadProtos();  
  const request = types.HandshakeRequest.create({  
    version: version || "1.0.0",  
    secret: secret || false,  
    key_finger: keyFinger || ""  
  });  
  return types.HandshakeRequest.encode(request).finish();  
}  
  
export function createHandshakeResponse(version, secret, publicKey, keyFinger) {  
  const types = loadProtos();  
  const response = types.HandshakeResponse.create({  
    version: version || "1.0.0",  
    secret: secret || false,  
    public_key: publicKey || new Uint8Array(0),  
    key_finger: keyFinger || ""  
  });  
  return types.HandshakeResponse.encode(response).finish();  
}  
  
export function createRegistrationRequest(token, deviceId, name, version, virtualIp, clientSecretHash) {  
  const types = loadProtos();  
  const request = types.RegistrationRequest.create({  
    token: token || "default",  
    device_id: deviceId || "",  
    name: name || "client",  
    is_fast: false,  
    version: version || "1.0.0",  
    virtual_ip: virtualIp || 0,  
    allow_ip_change: false,  
    client_secret: false,  
    client_secret_hash: clientSecretHash || new Uint8Array(0)  
  });  
  return types.RegistrationRequest.encode(request).finish();  
}  
  
export function createRegistrationResponse(virtualIp, gateway, netmask, epoch, deviceInfoList, publicIp, publicPort) {  
  const types = loadProtos();  
  const response = types.RegistrationResponse.create({  
    virtual_ip: virtualIp || 0,  
    virtual_gateway: gateway || 0,  
    virtual_netmask: netmask || 0,  
    epoch: epoch || 0,  
    device_info_list: deviceInfoList || [],  
    public_ip: publicIp || 0,  
    public_port: publicPort || 0,  
    public_ipv6: new Uint8Array(0)  
  });  
  return types.RegistrationResponse.encode(response).finish();  
}  
  
export function parseHandshakeRequest(data) {  
  const types = loadProtos();  
  return types.HandshakeRequest.decode(data);  
}  
  
export function parseRegistrationRequest(data) {  
  const types = loadProtos();  
  return types.RegistrationRequest.decode(data);  
}
