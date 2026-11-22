#!/usr/bin/env python3
"""Generate README navigation from the frozen source tree; preserve prose and legacy identities."""
import base64
import difflib
import hashlib
import json
import os
import re
from pathlib import Path
from urllib.parse import quote,urlsplit,unquote

SITE=Path(__file__).resolve().parents[1]
ROOT=SITE.parent
DOCS=SITE/'docs/wiki'
LABELS={
 'algorithm':'算法','sort':'排序','blockchain':'区块链','bitcoin':'比特币','address':'地址','bip':'BIP 提案','block':'区块','impl':'实现与验证','network':'网络','policy':'中继策略','script':'脚本','transaction':'交易','wallet':'钱包','coin':'其他公链','bsc':'BNB Smart Chain','defi':'DeFi','aave':'Aave','perps':'永续合约','uniswap':'Uniswap','ethereum':'以太坊','abi':'ABI 编码','consensus':'共识','contract':'智能合约','evm':'EVM','gas':'Gas','rpc':'RPC','state':'状态与存储','token':'Token','hyperliquid':'Hyperliquid','api':'API 接口','concepts':'基础概念','guides':'操作指南','quant':'量化交易','solana':'Solana','devops':'运维与交付','jenkins':'Jenkins','kubernetes':'Kubernetes','programming':'编程与数据库','common':'通用机制','epoll':'epoll','gc':'垃圾回收','cpp':'C++','concurrency':'并发','interview':'面试与练习','language':'语言特性','memory':'内存模型','stl':'标准库与算法','toolchain':'工具链','css':'CSS','animation':'动画与过渡','architecture':'架构与组织','basics':'基础','layout':'布局','responsive':'响应式布局','visual':'视觉与排版','dart':'Dart','database':'数据库','clickhouse':'ClickHouse','mysql':'MySQL','redis':'Redis','source':'源码阅读','go':'Go 导读','golang':'Go 专题','cgo':'cgo','channel':'Channel','chaos':'混沌工程','compile':'编译','context':'Context','data-race':'数据竞争','data-structure':'数据结构','goroutine':'Goroutine 与调度','lock':'锁','web':'Web','html':'HTML','a11y':'可访问性','forms':'表单','media':'媒体','performance':'性能','security':'安全','semantics':'语义','seo':'搜索引擎优化','java':'Java','collections':'集合','io-nio':'I/O 与 NIO','jvm':'JVM','javascript':'JavaScript','async':'异步','runtime':'运行时','lua':'Lua','nodejs':'Node.js','deploy':'部署','io':'I/O','modules':'模块','ops':'运维','php':'PHP','oop':'面向对象','framework':'框架','python':'Python','rust':'Rust','error':'错误处理','ffi':'FFI','macros':'宏','perf':'性能优化','testing':'测试','solidity':'Solidity','sql':'SQL','design':'建模与设计','indexing':'索引','query':'查询','tooling':'工具','transactions':'事务','typescript':'TypeScript','interop':'类型互操作','types':'类型系统','xss':'XSS'
}


def frontmatter(text):
    if not text.startswith('---\n'):return {}
    out={}
    for line in text.split('---',2)[1].splitlines():
        m=re.match(r'^([\w-]+):\s*(.*?)\s*$',line)
        if m:
            value=m[2]
            if value.startswith('"'):
                try:value=json.loads(value)
                except ValueError:pass
            elif value.startswith("'") and value.endswith("'"):value=value[1:-1].replace("''", "'")
            out[m[1]]=value
    return out


def article_title(text,path):
    fm=frontmatter(text)
    if fm.get('title'):return fm['title']
    for line in text.splitlines():
        m=re.match(r'^#{1,6}\s+(.+?)\s*#*$',line)
        if m:return re.sub(r'\s*\{#[^}]+\}\s*$','',m[1]).replace('`','')
    return path.stem


def directory_title(path):
    rel=path.relative_to(DOCS)
    if str(rel)=='.':return '知识库索引'
    parts=rel.parts
    assert all(p in LABELS for p in parts),parts
    if len(parts)==1:return LABELS[parts[0]]
    # Keep the language/protocol context while avoiding a repeated category prefix.
    start=parts[1] if parts[0] in ('programming','blockchain') else parts[0]
    if len(parts)==2:return LABELS[start] if parts[0] in ('programming','blockchain') else LABELS[start]+'：'+LABELS[parts[-1]]
    if parts[1]=='database':start=parts[2]
    return '：'.join(dict.fromkeys([LABELS[start],*[LABELS[x] for x in parts[2:] if x!=start]]))


def escaped(label):
    label=label.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('{','&#123;').replace('}','&#125;')
    for char in ('\\','[',']','*','_','`'):label=label.replace(char,'\\'+char)
    return label


def href(source,target):return './'+quote(os.path.relpath(target,source.parent),safe='/.-_')


def main():
    baseline=json.loads((SITE/'plans/wiki-readme-baseline.json').read_text())
    routes=json.loads((SITE/'plans/wiki-readme-routes-before.json').read_text())['pages']
    original={ROOT/p:base64.b64decode(data) for p,data in baseline['originalDocuments'].items()}
    for p,data in original.items():assert p.read_bytes()==data,('Concurrent document change; refresh before editing',str(p))
    directories=sorted(ROOT/p for p in baseline['directories'])
    migrations={ROOT/p:ROOT/p.replace('/index.md','/README.md') for p in baseline['indexFiles']}
    originals_to_new={p:migrations.get(p,p) for p in original}
    texts={originals_to_new[p]:data.decode() for p,data in original.items()}
    titles={p:article_title(text,p) for p,text in texts.items()}
    changes={};replacements=[]
    # Only Markdown destinations and HTML href attributes to the five exact files are replaced.
    pattern=re.compile(r'(\]\()([^\s)]+)(\))|(href=["\'])([^"\']+)(["\'])')
    for before,data in original.items():
        source=originals_to_new[before];text=data.decode();hits=[]
        def replace(m):
            target=m[2] or m[5];url=urlsplit(target)
            if url.scheme or url.netloc or not url.path:return m[0]
            if url.path.startswith('/'):
                # Site-relative public URLs stay unchanged; only source references resolve here.
                return m[0]
            dest=(before.parent/unquote(url.path)).resolve()
            if dest not in migrations:return m[0]
            newpath=href(source,migrations[dest])
            if url.fragment:newpath+='#'+url.fragment
            hits.append(dict(before=target,after=newpath,destinationBefore=str(dest.relative_to(ROOT)),destinationAfter=str(migrations[dest].relative_to(ROOT))))
            return (m[1] or m[4])+newpath+(m[3] or m[6])
        updated=pattern.sub(replace,text)
        if hits:replacements.append(dict(file=str(source.relative_to(ROOT)),links=hits));texts[source]=updated
    for old,new in migrations.items():
        text=texts[new];fm=frontmatter(text);meta=routes[str(old.relative_to(ROOT))]
        additions=[]
        if 'id' not in fm:additions.append('id: '+json.dumps(meta['id'].split('/')[-1]))
        if 'slug' not in fm:additions.append('slug: '+json.dumps(meta['slug']))
        if 'title' not in fm:additions.append('title: '+json.dumps(meta['title'],ensure_ascii=False))
        if additions:
            if text.startswith('---\n'):text='---\n'+'\n'.join(additions)+'\n'+text[4:]
            else:text='---\n'+'\n'.join(additions)+'\n---\n'+text
        texts[new]=text
    occupied={meta['permalink'].rstrip('/').casefold() for meta in routes.values()};added=[];inventory=[]
    for directory in directories:
        readme=directory/'README.md';title=directory_title(directory)
        articles=sorted([p for p in texts if p.parent==directory and p!=readme],key=lambda p:(titles[p].casefold(),p.name))
        children=sorted([d for d in directories if d.parent==directory],key=lambda d:(directory_title(d).casefold(),d.name))
        if readme not in texts:
            rel=directory.relative_to(DOCS).as_posix();slug='/wiki/'+('' if rel=='.' else rel+'/')
            if ('/docs'+slug).rstrip('/').casefold() in occupied:slug=slug.rstrip('/')+'/contents/'
            assert ('/docs'+slug).rstrip('/').casefold() not in occupied,slug
            occupied.add(('/docs'+slug).rstrip('/').casefold())
            subjects=[directory_title(d) for d in children]+[titles[p] for p in articles]
            assert subjects,directory
            intro='本目录收录'+'、'.join(escaped(t) for t in subjects[:3])+('等内容' if len(subjects)>3 else '')+'，可从下列入口阅读。'
            texts[readme]='---\ntitle: '+json.dumps(title,ensure_ascii=False)+'\nslug: '+json.dumps(slug)+'\n---\n\n# '+escaped(title)+'\n\n'+intro+'\n'
            added.append(str(readme.relative_to(ROOT)))
        block='\n\n## 本级目录 {#directory-index}\n'
        if children:
            block+='\n### 子目录 {#directory-children}\n\n'
            block+=''.join('- ['+escaped(directory_title(d))+']('+href(readme,d/'README.md')+')\n' for d in children)
        if articles:
            block+='\n### 本级文章 {#directory-articles}\n\n'
            block+=''.join('- ['+escaped(titles[p])+']('+href(readme,p)+')\n' for p in articles)
        if directory!=DOCS:block+='\n返回[上一级：'+escaped(directory_title(directory.parent))+']('+href(readme,directory.parent/'README.md')+')。\n'
        texts[readme]+=block
        inventory.append(dict(directory=str(directory.relative_to(ROOT)),readme=str(readme.relative_to(ROOT)),title=title,articles=[str(p.relative_to(ROOT)) for p in articles],children=[str(p.relative_to(ROOT)) for p in children],parentReadme=None if directory==DOCS else str((directory.parent/'README.md').relative_to(ROOT))))
    for p,text in texts.items():
        data=text.encode();before=next((old for old,new in originals_to_new.items() if new==p),None)
        if before is None or data!=original[before]:
            if before:
                assert before.read_bytes()==original[before],('Concurrent target change',str(before))
                if before!=p:assert not p.exists(),str(p)
            else:assert not p.exists(),str(p)
            p.write_bytes(data)
            if before:
                changes[str(before.relative_to(ROOT))]=dict(afterFile=str(p.relative_to(ROOT)),beforeSha256=hashlib.sha256(original[before]).hexdigest(),afterSha256=hashlib.sha256(data).hexdigest(),diff=''.join(difflib.unified_diff(original[before].decode().splitlines(True),text.splitlines(True),fromfile=str(before.relative_to(ROOT)),tofile=str(p.relative_to(ROOT)))))
    for old,new in migrations.items():
        assert old.read_bytes()==original[old],('Concurrent migration change',str(old))
        old.unlink()
    report=dict(addedReadmes=added,modifiedOrMoved=changes,migrations=[dict(before=str(a.relative_to(ROOT)),after=str(b.relative_to(ROOT)),identity=routes[str(a.relative_to(ROOT))]) for a,b in migrations.items()],sourceLinkReplacements=replacements,directories=inventory)
    (SITE/'plans/wiki-readme-changes.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    (SITE/'plans/wiki-readme-allowed.diff').write_text(''.join(r['diff'] for r in changes.values()))
    print('Generated',len(added),'new READMEs;',len(migrations),'index migrations;',len(changes),'modified/moved originals;',len(directories),'directories')


if __name__=='__main__':main()
