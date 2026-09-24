import pymupdf as fitz, re, json, sys
PDF=sys.argv[1] if len(sys.argv)>1 else "programfuzet.pdf"
d=fitz.open(PDF)
TIME=re.compile(r'^(\d{1,2})\.(\d{2})(?:\s*[–-]\s*(\d{1,2})\.(\d{2}))?\s*$')
entries=[]; cur=None; day=None
def lines_of(half):
    # group spans into lines by (col, y)
    rows={}
    for s in half:
        key=(s["col"], round(s["y"]/2.5))
        rows.setdefault(key,[]).append(s)
    out=[]
    for (col,_),ss in rows.items():
        ss.sort(key=lambda s:s["x"])
        out.append({"col":col,"y":min(s["y"] for s in ss),"spans":ss})
    out.sort(key=lambda l:(round(l["y"]/2.5), l["col"]!="L"))
    return out
def txt(spans): return "".join(s["text"] for s in spans)
for pno,p in enumerate(d):
    if pno<2 or pno>50: continue
    W=p.rect.width/2
    halves={0:[],1:[]}
    for b in p.get_text("dict")["blocks"]:
        for l in b.get("lines",[]):
            for s in l["spans"]:
                x,y=s["bbox"][0],s["bbox"][1]
                h=1 if x>=W else 0
                rx=x-h*W
                t=s["text"].replace("\n","")
                if not t.strip(): 
                    if t: pass
                if s["font"].startswith("Apple"): continue
                if round(s["size"])==11 and "október" in t:
                    m=re.search(r'október (\d)',t); halves[h].append({"day":int(m.group(1)),"y":y}); continue
                if round(s["size"])==20:
                    w=t.replace(" ","").strip().lower()
                    for name,n in (("csütörtök",1),("péntek",2),("szombat",3),("vasárnap",4)):
                        if name in w: halves[h].append({"day":n,"y":y})
                    continue
                if round(s["size"])!=9 or y<32 or y>565: continue
                halves[h].append({"text":t,"x":x,"y":y,"col":"L" if rx<70 else "C","font":s["font"],"color":"%06x"%s["color"]})
    for h in (0,1):
        items=halves[h]
        for it in items:
            if "day" in it: day=it["day"]
        spans=[i for i in items if "day" not in i]
        for line in lines_of(spans):
            t=txt(line["spans"]).strip()
            if line["col"]=="L" and TIME.match(t) and "Bold" in line["spans"][0]["font"]:
                m=TIME.match(t)
                cur={"day":day,"start":f"{int(m.group(1)):02d}:{m.group(2)}","end":f"{int(m.group(3)):02d}:{m.group(4)}" if m.group(3) else None,
                     "venueLines":[],"content":[],"page":pno}
                entries.append(cur); continue
            if cur is None: continue
            if line["col"]=="L":
                cur["venueLines"].append(t)
            else:
                cur["content"].append(line["spans"]); line["spans"][0]["ly"]=line["y"]; line["spans"][0]["lpage"]=(pno,h)
def join(lines):
    out=""
    for l in lines:
        l=l.strip()
        if not l: continue
        if out.endswith("-") and l[:1].islower(): out=out[:-1]+l
        elif out.endswith("–") or not out: out+=(" " if out else "")+l
        else: out+=" "+l
    return re.sub(r'\s+',' ',out).strip()
result=[]
for e in entries:
    title_lines=[];rest=[];in_title=True;color=None
    for spans in e["content"]:
        vis=[s for s in spans if s["text"].strip()]
        bold=all("Bold" in s["font"] or s["color"] in ("dc3c43","f48939") for s in vis)
        if in_title and bold:
            title_lines.append(txt(spans)); color=color or spans[0]["color"]
        else:
            in_title=False; rest.append(spans)
    series=None
    if len(title_lines)>1 and title_lines[0].strip().isupper() and not title_lines[1].strip().isupper():
        series=title_lines[0].strip().title() if False else title_lines[0].strip(); title_lines=title_lines[1:]
    # organizer: trailing italic lines starting with '('
    org_lines=[]
    while rest and all("Italic" in s["font"] for s in rest[-1] if s["text"].strip()):
        org_lines.insert(0,txt(rest[-1]))
        rest.pop()
        if org_lines[0].strip().startswith("("): break
    org=join(org_lines)
    if not org.startswith("("): rest+= [[{"text":l,"font":"Calibri"}] for l in org_lines]; org=""
    paras=[]; para=[]; last=None
    for spans in rest:
        y=spans[0].get("ly"); pg=spans[0].get("lpage")
        if para and last and y is not None and last[1]==pg and y-last[0]>12.5:
            paras.append(join(para)); para=[]
        para.append(txt(spans)); last=(y,pg) if y is not None else last
    if para: paras.append(join(para))
    desc="\n".join(x for x in paras if x)
    title=join(title_lines)
    if not title:
        title=re.split(r'(?<=[.!?])\s',desc,1)[0].rstrip(".")
    kind="signing" if color=="f48939" else "program"
    result.append({"day":e["day"],"start":e["start"],"end":e["end"],"venue":join(e["venueLines"]),
        "title":title,"series":series,"desc":desc,"org":org.strip("() "),"kind":kind,"page":e["page"]})
json.dump(result,open("raw.json","w"),ensure_ascii=False,indent=1)
from collections import Counter
print(len(result), Counter((r["day"],r["kind"]) for r in result))
print(Counter(r["venue"] for r in result).most_common(80))
