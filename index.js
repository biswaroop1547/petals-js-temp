import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { kadDHT } from '@libp2p/kad-dht'
import { webRTCDirect, webRTC } from '@libp2p/webrtc'
import { webSockets } from '@libp2p/websockets'
import { webTransport } from '@libp2p/webtransport'
import { createLibp2p } from 'libp2p'
import { circuitRelayTransport } from 'libp2p/circuit-relay'
import { identifyService } from 'libp2p/identify'

document.addEventListener('DOMContentLoaded', async () => {
  // Create our libp2p node
  const libp2p = await createLibp2p({
    // transports allow us to dial peers that support certain types of addresses
    transports: [
      webSockets(),
      webTransport(),
      webRTC(),
      webRTCDirect(),
      circuitRelayTransport({
        // use content routing to find a circuit relay server we can reserve a
        // slot on
        discoverRelays: 1
      })
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    peerDiscovery: [
      bootstrap({
        list: [
          "/dns/bootstrap1.petals.dev/tcp/31337/p2p/QmedTaZXmULqwspJXz44SsPZyTNKxhnnFvYRajfH7MGhCY",
          "/dns/bootstrap2.petals.dev/tcp/31338/p2p/QmQGTqmM7NKjV6ggU1ZCap8zWiyKR89RViDXiqehSiCpY5",
          "/dns6/bootstrap1.petals.dev/tcp/31337/p2p/QmedTaZXmULqwspJXz44SsPZyTNKxhnnFvYRajfH7MGhCY",
          "/dns6/bootstrap2.petals.dev/tcp/31338/p2p/QmQGTqmM7NKjV6ggU1ZCap8zWiyKR89RViDXiqehSiCpY5",
          "/ip4/159.89.214.152/tcp/31337/p2p/QmedTaZXmULqwspJXz44SsPZyTNKxhnnFvYRajfH7MGhCY",
          "/ip4/159.203.156.48/tcp/31338/p2p/QmQGTqmM7NKjV6ggU1ZCap8zWiyKR89RViDXiqehSiCpY5",
        ]
      })
    ],
    services: {
      // the identify service is used by the DHT and the circuit relay transport
      // to find peers that support the relevant protocols
      identify: identifyService(),

      // the DHT is used to find circuit relay servers we can reserve a slot on
      dht: kadDHT({
        // browser node ordinarily shouldn't be DHT servers
        clientMode: true
      })
    }
  })

  // UI elements
  const status = document.getElementById('status')
  const output = document.getElementById('output')

  output.textContent = ''

  function log (txt) {
    console.info(txt)
    output.textContent += `${txt.trim()}\n`
  }

  // Listen for new peers
  libp2p.addEventListener('peer:discovery', (evt) => {
    const peerInfo = evt.detail
    log(`Found peer ${peerInfo.id.toString()}`)

    // dial them when we discover them
    libp2p.dial(peerInfo.id).catch(err => {
      log(`Could not dial ${peerInfo.id.toString()}`, err)
    })
  })

  // Listen for new connections to peers
  libp2p.addEventListener('peer:connect', (evt) => {
    const peerId = evt.detail
    log(`Connected to ${peerId.toString()}`)
  })

  // Listen for peers disconnecting
  libp2p.addEventListener('peer:disconnect', (evt) => {
    const peerId = evt.detail
    log(`Disconnected from ${peerId.toString()}`)
  })

  status.innerText = 'libp2p started!'
  log(`libp2p id is ${libp2p.peerId.toString()}`)

  // Export libp2p to the window so you can play with the API
  window.libp2p = libp2p
})