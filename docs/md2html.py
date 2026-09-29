import re, html, sys
src=open(sys.argv[1],encoding='utf-8').read().split('\n')
def inline(t):
    t=html.escape(t)
    t=re.sub(r'`([^`]+)`',r'<code>\1</code>',t)
    t=re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',t)
    t=re.sub(r'(https?://[^\s<)]+)',r'<a href="\1">\1</a>',t)
    return t
out=[];i=0
while i<len(src):
    l=src[i]
    if l.startswith('```'):
        i+=1;buf=[]
        while not src[i].startswith('```'): buf.append(src[i]);i+=1
        out.append('<pre>'+html.escape('\n'.join(buf))+'</pre>')
    elif l.startswith('|'):
        rows=[]
        while i<len(src) and src[i].startswith('|'):
            rows.append([c.strip() for c in src[i].strip('|').split('|')]);i+=1
        i-=1
        rows=[r for r in rows if not all(set(c)<=set('-: ') for c in r)]
        h='<table><tr>'+''.join(f'<th>{inline(c)}</th>' for c in rows[0])+'</tr>'
        for r in rows[1:]: h+='<tr>'+''.join(f'<td>{inline(c)}</td>' for c in r)+'</tr>'
        out.append(h+'</table>')
    elif l.startswith('- '):
        out.append('<ul>')
        while i<len(src) and src[i].startswith('- '):
            item=src[i][2:];i+=1
            while i<len(src) and src[i].startswith('  '): item+=' '+src[i].strip();i+=1
            out.append(f'<li>{inline(item)}</li>')
        i-=1;out.append('</ul>')
    elif l.startswith('# '): out.append(f'<h1>{inline(l[2:])}</h1>')
    elif l.startswith('## '): out.append(f'<h2>{inline(l[3:])}</h2>')
    elif l.startswith('### '): out.append(f'<h3>{inline(l[4:])}</h3>')
    elif l.strip():
        p=l
        while i+1<len(src) and src[i+1].strip() and not re.match(r'(#|```|\||- )',src[i+1]): i+=1;p+=' '+src[i]
        out.append(f'<p>{inline(p)}</p>')
    i+=1
css='body{font-family:Segoe UI,Arial,sans-serif;font-size:11pt;line-height:1.45;margin:0}h1{font-size:20pt;color:#0a7d3e}h2{font-size:14pt;border-bottom:1px solid #ccc;padding-bottom:3px;margin-top:18px}pre{background:#f2f5f3;padding:8px;font-size:8.5pt;white-space:pre-wrap;border-radius:4px}code{background:#f2f5f3;padding:0 3px;font-size:9.5pt}table{border-collapse:collapse;width:100%;font-size:9.5pt}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left;vertical-align:top}th{background:#e8f3ec}a{color:#0a7d3e}'
open(sys.argv[2],'w',encoding='utf-8').write(f'<!doctype html><meta charset=utf-8><style>{css}</style>'+'\n'.join(out))
