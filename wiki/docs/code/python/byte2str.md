```python
#!/usr/bin/env python
# coding=utf-8
import codecs

# byte string to be converted
#b_string = b'\xc3\xa9\xc3\xa0\xc3\xb4'
b_string = b'\x85\xfd\xda\xd7\x14\x98\xb4\xb7:\xbb\xf2\xde\xf0\xc8/\xdcI\x83\x18\x1f\x8c\xb5\x85DK\xad#\xfa\x96\xe5\xbb\xbf\x00\x00\x00\x00'
# decoding the byte string to unicode string
u_string = b_string.hex()

print(u_string)
```