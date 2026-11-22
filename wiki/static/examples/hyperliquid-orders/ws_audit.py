import inspect,unittest.mock as m,websocket._app,json,hashlib,pathlib
from hyperliquid.websocket_manager import WebsocketManager
x=WebsocketManager('https://api.hyperliquid-testnet.xyz');x.ws=m.Mock();x.ping_sender=m.Mock();x.run()
x.ping_sender.start.assert_called_once_with();x.ws.run_forever.assert_called_once_with()
assert websocket._app.RECONNECT==0
p=pathlib.Path(websocket._app.__file__)
r=dict(websocketClientVersion='1.9.2',defaultRECONNECT=websocket._app.RECONNECT,managerRunCalls=str(x.ws.run_forever.call_args),sourceSha256=hashlib.sha256(p.read_bytes()).hexdigest(),runForeverSource=inspect.getsource(websocket._app.WebSocketApp.run_forever),scope='Mock transport confirms SDK run calls; no real WS connection or outage test')
pathlib.Path(__file__).with_name('ws-audit.json').write_text(json.dumps(r,indent=2)+'\n')
print('PASS: SDK calls run_forever without reconnect options; locked client default RECONNECT=0')
