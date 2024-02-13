## healthcheck

### code

```shell
#!/bin/bash
# apk add curl jq

CUR_NODE_NAME="test-eth"
CUR_NODE_RPC_URL="http://localhost:8545"
LARK_WEBHOOK_URL=""
PUBLIC_NODES="https://eth-mainnet.public.blastapi.io"
THRESHOLD=0

# restart
RESTART_THRESHOLD=10

function parse_json(){
     echo "${1//\"/}"|sed "s/.*$2:\([^,}]*\).*/\1/"
}

cur_node_block_height_result=$(curl -s -X POST $CUR_NODE_RPC_URL --header 'Content-Type: application/json' \
    --data-raw '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[], "id": 1}')
cur_node_hex_height=$(parse_json $cur_node_block_height_result "result")
cur_node_dec_height=$(echo -n $cur_node_hex_height | xargs printf "%d")
echo "-- $CUR_NODE_RPC_URL -- " $cur_node_dec_height

# 节点 peer 监控
cur_node_peer_result=`curl -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"net_peerCount","id":64}' $CUR_NODE_RPC_URL 2>/dev/null`
peers_count=$(parse_json $cur_node_peer_result "result")
echo "Number of Node Connections: $((16#${peers_count:2}))"
if [[ `printf "%d" $peers_count` == "0" || `printf "%d" $peers_count` == "1" ]]; then
	peer_message="The node $CUR_NODE_NAME peer is low."
	curl -X POST -H "Content-Type: application/json" -d '{"msg_type":"text","content":{"text":"'"${peer_message}"'"}}' $LARK_WEBHOOK_URL
	exit 1;
fi

need_exit=false
for value in $PUBLIC_NODES
do
    cur_hex_height=$(curl -s -X POST $value --header 'Content-Type: application/json' \
    --data-raw '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[], "id": 1}' | jq -r .result)
	cur_dec_height=$(echo -n $cur_hex_height | xargs printf "%d")
	diff="$(($cur_dec_height-$cur_node_dec_height))"
	echo "-- $value -- " $cur_dec_height "diff:" $diff
	if [ "$diff" -gt "$THRESHOLD" ]; then
		message="The node $CUR_NODE_NAME is not in sync, diff is $diff, now height is $cur_node_dec_height, $value, public node height is $cur_dec_height"
		echo $message
		curl -X POST -H "Content-Type: application/json" -d '{"msg_type":"text","content":{"text":"'"${message}"'"}}' $LARK_WEBHOOK_URL
	fi
	if [ "$diff" -gt "$RESTART_THRESHOLD" ]; then
		need_exit=true
	fi
done

if $need_exit; then
	echo "needExit";
	exit 1;
fi
exit 0;
```
