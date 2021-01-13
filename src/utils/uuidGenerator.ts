import { v4 as uuidv4 } from 'uuid';
/*
  * 因为 IE10 不支持 Crypto.getRandomValues() 接口，而常用的 uuid 等三方包都是基于此接口
  * 实现的，所以这里引用了网上的一种生成算法
 * Generate a random uuid. 
 * 
 * USAGE: Math.uuid(length, radix) 
 *   length - the desired number of characters 
 *   radix  - the number of allowable values for each character. 
 * 
 * EXAMPLES: 
 *   // No arguments  - returns RFC4122, version 4 ID 
 *   >>> Math.uuid() 
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172" 
 * 
 *   // One argument - returns ID of the specified length 
 *   >>> Math.uuid(15)     // 15 character ID (default base=62) 
 *   "VcydxgltxrVZSTV" 
 * 
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62) 
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2) 
 *   "01001010" 
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10) 
 *   "47473046" 
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16) 
 *   "098F4D35" 
 */ 
// Private array of chars to use  
const CHARS: string[] = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
export function uuidGenerator(len?: number, radix: number = CHARS.length) {
  const chars: string[] = CHARS;
  const uuid: string[] = [];

  if (len) {
    for (let i = 0; i < len; i++) {
      uuid[i] = chars[0 | (Math.random() * radix)];
    }    
  } else {
    // rfc4122, version 4 form
    // rfc4122 requires these characters 
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as  
    // per rfc4122, sec. 4.1.5 
    for (let i = 0; i < 36; i++) {
      if (!uuid[i]) {
        let r = 0 | (Math.random() * 16);
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}
// 默认导出 uuidv4，当浏览器不支持 crypto 时，导出自定义的生成器
let uuid: any = uuidv4; 
if (typeof crypto === 'undefined') {
  uuid = uuidGenerator;
}

export default uuid;