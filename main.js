import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'

const node = await createLibp2p({
  // libp2p nodes are started by default, pass false to override this
  start: false,
  addresses: {
    listen: ['/ip4/127.0.0.1/tcp/8000/ws']
  },
  transports: [webSockets()],
  connectionEncryption: [noise()],
  streamMuxers: [yamux(), mplex()]
})

// start libp2p
await node.start()
console.log('libp2p has started')

const listenAddrs = node.getMultiaddrs()
console.log('libp2p is listening on the following addresses: ', listenAddrs)

// stop libp2p
await node.stop()
console.log('libp2p has stopped')